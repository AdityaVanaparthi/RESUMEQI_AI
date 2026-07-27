"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ResultDashboard, { AnalysisResult } from "@/app/components/ResultDashboard";

export default function ResultPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("resumeiq-result");
      if (raw) setResult(JSON.parse(raw));
    } catch {
      setResult(null);
    } finally {
      setReady(true);
    }
  }, []);

  return (
    <main className="upload-page">
      <span className="eyebrow">Free AI review</span>
      <h1>
        Your resume,
        <br />
        clearly scored.
      </h1>
      <p>Here&apos;s the breakdown of your resume and how it stacks up.</p>

      <section className="upload-card">
        {!ready ? (
          <p className="upload-note">Loading your results…</p>
        ) : result ? (
          <ResultDashboard result={result} />
        ) : (
          <div className="tab-panel">
            <p className="upload-note">No analysis found. Upload a resume to get your results.</p>
            <Link href="/upload" className="button button-primary" style={{ marginTop: 14 }}>
              Analyze my resume <span>→</span>
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}