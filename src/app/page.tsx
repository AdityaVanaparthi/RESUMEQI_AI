import Link from "next/link";

const features = [
  ["01", "Upload your resume", "Drop in your current resume in PDF or DOCX format."],
  ["02", "Let AI do the analysis", "Get a clear, practical evaluation of your skills and experience."],
  ["03", "Apply with confidence", "Use targeted feedback to make every application stronger."],
];

export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Your next role, clarified</span>
          <h1>Turn your resume into your strongest advantage.</h1>
          <p>
            ResumeIQ gives you the honest, AI-powered feedback you need to stand
            out in a crowded job market.
          </p>
          <div className="hero-actions">
            <Link href="/upload" className="button button-primary">Analyze my resume <span>→</span></Link>
            <a href="#how-it-works" className="button button-secondary">See how it works</a>
          </div>
          <div className="trust-row">
            <div className="avatars"><span>AP</span><span>JD</span><span>MS</span><span>+</span></div>
            <p><strong>10,000+ job seekers</strong><br />already improving their chances</p>
          </div>
        </div>
        <div className="resume-preview" aria-label="Resume analysis preview">
          <div className="preview-glow" />
          <div className="score-card">
            <div className="score-top"><span>YOUR SCORES</span><span className="score-trend">↑ 12 pts</span></div>
            <div className="score-mini-row">
              <div className="score-mini">
                <span className="score-mini-label">Resume</span>
                <div className="score-mini-number">84</div>
                <div className="score-mini-bar"><span style={{ width: "84%" }} /></div>
              </div>
              <div className="score-mini">
                <span className="score-mini-label">ATS</span>
                <div className="score-mini-number">76</div>
                <div className="score-mini-bar"><span style={{ width: "76%" }} /></div>
              </div>
            </div>
            <p>Looking strong! A few changes could make a big difference.</p>
          </div>
          <div className="paper-card">
            <div className="paper-heading"><span className="paper-avatar">A</span><div><b>Alex Morgan</b><small>Product Designer</small></div></div>
            <div className="paper-lines"><i /><i /><i className="short" /></div>
            <div className="paper-section"><b>Experience</b><i /><i /><i className="short" /></div>
            <div className="paper-section">
              <b>Skills</b>
              <div className="skill-pills">
                <span className="skill-pill-found">UX Design</span>
                <span className="skill-pill-found">Figma</span>
                <span className="skill-pill-missing">Usability Testing</span>
              </div>
            </div>
          </div>
          <div className="insight-card"><span className="sparkle">✦</span><div><b>Top insight</b><p>Add measurable outcomes to your last role.</p></div></div>
        </div>
      </section>

      <section id="how-it-works" className="process-section">
        <div className="section-intro"><span className="eyebrow">Simple by design</span><h2>A better resume is three steps away.</h2></div>
        <div className="steps">
          {features.map(([number, title, text]) => <article className="step" key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section className="cta-section">
        <span className="eyebrow">Start today</span><h2>Your next opportunity deserves a better resume.</h2>
        <Link href="/upload" className="button button-primary">Get my free analysis <span>→</span></Link>
      </section>
    </main>
  );
}