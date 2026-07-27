export type AnalysisResult = {
  resumeScore: number;
  atsScore: number;
  skillsFound: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

function ScoreTile({ label, value }: { label: string; value: number }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  const barColor = clamped < 40 ? "#e24b4a" : clamped < 70 ? "#f0a63c" : "#87d5b2";
  return (
    <div className="score-tile">
      <span className="score-tile-label">{label}</span>
      <div className="score-tile-value">
        {clamped}
        <span>/100</span>
      </div>
      <div className="score-tile-bar">
        <span style={{ width: `${clamped}%`, background: barColor }} />
      </div>
    </div>
  );
}

function PillList({ items, tone }: { items: string[]; tone: "found" | "missing" }) {
  if (!items.length) return <p className="upload-note">None identified.</p>;
  return (
    <div className="pill-list">
      {items.map((item) => (
        <span key={item} className={`pill pill-${tone}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function InsightList({ items, tone }: { items: string[]; tone: "strength" | "weakness" | "suggestion" }) {
  if (!items.length) return <p className="upload-note">Nothing to show.</p>;
  return (
    <ul className={`insight-list insight-${tone}`}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function ResultDashboard({ result }: { result: AnalysisResult }) {
  return (
    <div className="dashboard" aria-live="polite">
      <span className="eyebrow">Your ResumeIQ analysis</span>

      <div className="score-row">
        <ScoreTile label="Resume Score" value={result.resumeScore} />
        <ScoreTile label="ATS Score" value={result.atsScore} />
      </div>

      <div className="skills-grid">
        <div className="skills-col">
          <h3>Skills Found</h3>
          <PillList items={result.skillsFound} tone="found" />
        </div>
        <div className="skills-col skills-col-divided">
          <h3>Missing Skills</h3>
          <PillList items={result.missingSkills} tone="missing" />
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Strengths</h3>
        <InsightList items={result.strengths} tone="strength" />
      </div>

      <div className="dashboard-section">
        <h3>Weaknesses</h3>
        <InsightList items={result.weaknesses} tone="weakness" />
      </div>

      <div className="dashboard-section">
        <h3>Suggestions</h3>
        <InsightList items={result.suggestions} tone="suggestion" />
      </div>
    </div>
  );
}