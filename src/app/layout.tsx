import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = { title: "ResumeIQ — Resume feedback that gets you hired", description: "Get AI-powered feedback on your resume." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>
    <header className="site-header"><Link href="/" className="brand"><span className="brand-mark">R</span>ResumeIQ</Link><nav><a href="#how-it-works">How it works</a><a href="#footer">About</a></nav><Link href="/upload" className="nav-cta">Analyze resume <span>→</span></Link></header>
    {children}
    <footer id="footer"><Link href="/" className="brand"><span className="brand-mark">R</span>ResumeIQ</Link><p>Thoughtful resume feedback, powered by AI.</p><div><a href="#how-it-works">How it works</a><a href="mailto:hello@resumeiq.ai">Contact</a><a href="#">Privacy</a></div><small>© 2026 ResumeIQ. Built for your next chapter.</small></footer>
  </body></html>;
}
