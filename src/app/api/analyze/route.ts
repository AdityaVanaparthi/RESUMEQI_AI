import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

export const runtime = "nodejs";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const fail = (message: string, status: number) => Response.json({ error: message }, { status });

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    resumeScore: { type: "number", description: "Overall resume quality, 0-100" },
    atsScore: { type: "number", description: "ATS/keyword-parseability score, 0-100" },
    skillsFound: { type: "array", items: { type: "string" }, description: "Relevant skills clearly present in the resume" },
    missingSkills: { type: "array", items: { type: "string" }, description: "Important skills that are absent or under-represented" },
    strengths: { type: "array", items: { type: "string" }, description: "3-5 specific strong points" },
    weaknesses: { type: "array", items: { type: "string" }, description: "3-5 specific weak points" },
    suggestions: { type: "array", items: { type: "string" }, description: "3-6 concrete, actionable improvements" },
  },
  required: ["resumeScore", "atsScore", "skillsFound", "missingSkills", "strengths", "weaknesses", "suggestions"],
};

export type AnalysisResult = {
  resumeScore: number;
  atsScore: number;
  skillsFound: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

async function generateWithRetry(
  ai: GoogleGenAI,
  params: Parameters<GoogleGenAI["models"]["generateContent"]>[0],
  retries = 1
) {
  try {
    return await ai.models.generateContent(params);
  } catch (cause) {
    const is503 = cause instanceof Error && /UNAVAILABLE|503/i.test(cause.message);
    if (is503 && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return generateWithRetry(ai, params, retries - 1);
    }
    throw cause;
  }
}

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) return fail("The resume analysis service is not configured yet.", 503);
  try {
    const formData = await request.formData();
    const file = formData.get("resume");
    const jobDescription = String(formData.get("jobDescription") ?? "").trim().slice(0, 20000);
    if (!(file instanceof File)) return fail("Please choose a PDF resume.", 400);
    if (!file.size) return fail("The selected file is empty.", 400);
    if (file.size > MAX_FILE_SIZE) return fail("Your PDF must be 10 MB or smaller.", 400);
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return fail("Only PDF resumes are supported right now.", 400);
    const buffer = Buffer.from(await file.arrayBuffer());
    if (buffer.subarray(0, 5).toString() !== "%PDF-") return fail("This file is not a valid PDF.", 400);
    let resumeText = "";
    try {
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      await parser.destroy();
      resumeText = result.text.replace(/\s+/g, " ").trim();
    } catch (cause) {
      console.error("PDF text extraction failed:", cause);
    }
    let result: AnalysisResult | undefined;
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are ResumeIQ, an expert and encouraging resume reviewer. Analyze the candidate's resume${jobDescription ? " against the supplied job description" : ""} and return your evaluation as data, not prose.

Scoring guidance:
- resumeScore: overall quality of the resume itself (clarity, impact, structure, achievements) from 0-100.
- atsScore: how well an Applicant Tracking System would parse and rank this resume${jobDescription ? " for this specific job" : ""} from 0-100, based on formatting simplicity, keyword coverage${jobDescription ? ", and alignment with the job description" : ""}.
- skillsFound: concrete skills clearly evidenced in the resume.
- missingSkills: ${jobDescription ? "skills the job description asks for that are absent or weakly shown in the resume" : "important skills for this candidate's apparent target role that are absent or weakly shown"}.
- strengths / weaknesses: specific, resume-grounded observations, not generic advice.
- suggestions: concrete, actionable edits the candidate can make.

Do not invent achievements or facts not present in the resume.${jobDescription ? `\n\nJOB DESCRIPTION:\n${jobDescription}` : ""}${resumeText.length >= 50 ? `\n\nEXTRACTED RESUME TEXT:\n${resumeText.slice(0, 40000)}` : "\n\nThe attached PDF is a scanned resume. Read it visually before responding."}`;
      const contents = resumeText.length >= 50 ? [{ text: prompt }] : [{ text: prompt }, { inlineData: { mimeType: "application/pdf", data: buffer.toString("base64") } }];
      const response = await generateWithRetry(ai, {
        model: "gemini-3.6-flash",
        contents,
        config: { responseMimeType: "application/json", responseSchema: RESULT_SCHEMA },
      });
      const raw = response.text?.trim();
      if (raw) {
        try {
          result = JSON.parse(raw) as AnalysisResult;
        } catch (parseError) {
          console.error("Failed to parse Gemini JSON output:", parseError, raw);
        }
      }
    } catch (cause) {
      console.error("Gemini analysis failed:", cause);
      return fail("Gemini couldn't complete the analysis right now. Please try again shortly.", 502);
    }
    if (!result) return fail("The AI service returned no analysis. Please try again.", 502);
    return Response.json({ result });
  } catch (cause) { console.error("Resume analysis failed:", cause); return fail("We couldn't analyze this resume. Please try again in a moment.", 500); }
}