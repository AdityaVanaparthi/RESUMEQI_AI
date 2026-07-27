"use client";

import { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    setFile(event.target.files?.[0] ?? null);
    setError("");
  }

  async function analyzeResume() {
    if (!file) return setError("Choose a PDF resume to continue.");
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setError("Please choose a PDF file.");
    if (file.size > 10 * 1024 * 1024) return setError("Your PDF must be 10 MB or smaller.");

    setIsLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    try {
      const response = await fetch("/api/analyze", { method: "POST", body: formData });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Analysis failed. Please try again.");
      sessionStorage.setItem("resumeiq-result", JSON.stringify(body.result));
      router.push("/result");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Analysis failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <main className="upload-page">
      <span className="eyebrow">Free AI review</span>
      <h1>
        Let&apos;s make your resume
        <br />
        work harder for you.
      </h1>
      <p>Upload your resume, add a job description if you have one, and get clear, actionable feedback in minutes.</p>

      <section className="upload-card">
        <div className="form-section">
          <label className="jd-label">Step 1 — Upload your resume</label>
          <div className="dropzone">
            <div className="upload-icon">&#8593;</div>
            <h2>{file?.name || "Drop your resume here"}</h2>
            <p>{file ? `${Math.ceil(file.size / 1024)} KB · ready for analysis` : "PDF, up to 10 MB"}</p>
            <label className="upload-label">
              Choose a PDF
              <input type="file" accept="application/pdf,.pdf" onChange={onFileChange} />
            </label>
          </div>
        </div>

        <div className="form-section">
          <label className="jd-label" htmlFor="job-description">
            Step 2 — Job description (optional)
          </label>
          <textarea
            id="job-description"
            className="jd-textarea"
            placeholder="Paste the job posting here to get a tailored match analysis, or leave blank for general resume feedback."
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value.slice(0, 20000))}
            rows={8}
          />
          <p className="upload-note">{jobDescription.length.toLocaleString()} / 20,000 characters</p>
        </div>

        <button type="button" className="analyze-button" disabled={!file || isLoading} onClick={analyzeResume}>
          {isLoading ? "Analyzing your resume…" : "Analyze my resume →"}
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <p className="upload-note">Your file stays private and is only used to generate your feedback.</p>
      </section>
    </main>
  );
}