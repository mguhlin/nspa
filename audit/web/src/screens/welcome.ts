import type { Store } from '../audit/state';
import { CATALOG } from '../audit/catalog';
import { esc } from '../a11y/helpers';
import { hasLocalEncryptedCopy } from '../storage/localAutosave';

export interface WelcomeActions {
  onOpenSsatModal: () => void;
  onUnlockLocalCopy: () => void;
  onClearLocalCopy: () => void;
}

export function renderWelcome(store: Store): string {
  const state = store.get();
  const hasLocal = hasLocalEncryptedCopy();

  const lessonsHtml = CATALOG.onboarding_lessons
    .map(
      (lesson, idx) => `
      <details class="lesson-card" ${idx === 0 ? 'open' : ''}>
        <summary>
          <span class="badge badge-info">${esc(lesson.domain_id)}</span>
          <strong>${esc(lesson.title)}</strong>
        </summary>
        <div class="lesson-body">
          <div class="compare-grid">
            <div class="compare-card compare-good">
              <h4>Good evidence example (Fictional)</h4>
              <p>${esc(lesson.good_example)}</p>
            </div>
            <div class="compare-card compare-weak">
              <h4>Insufficient evidence</h4>
              <p>${esc(lesson.weak_example)}</p>
            </div>
          </div>
          <p class="why-score"><strong>Why this earns 0, 1, or 2:</strong> ${esc(lesson.why_score)}</p>
          <div class="practice-check" data-practice-lesson="${esc(lesson.id)}">
            <span class="practice-label">Quick check — what score would the weak example earn?</span>
            <div class="btn-row">
              <button type="button" class="btn btn-sm btn-outline" data-lesson-guess="${esc(lesson.id)}" data-guess="0">0 or 1 (Needs proof)</button>
              <button type="button" class="btn btn-sm btn-outline" data-lesson-guess="${esc(lesson.id)}" data-guess="2">2 (Verified)</button>
            </div>
            <p class="practice-feedback muted" id="feedback-${esc(lesson.id)}" aria-live="polite"></p>
          </div>
        </div>
      </details>
    `
    )
    .join('');

  return `
    <section class="hero-band" aria-labelledby="welcome-heading">
      <div class="hero-visual-banner">
        <figure class="hero-figure">
          <img
            src="./hero-audit.webp"
            width="1280"
            height="720"
            fetchpriority="high"
            alt="Scholarship Security Audit Toolkit overview showing applicant, award, document, and donor folders alongside a laptop displaying an audit checklist, readiness ring, Likelihood by Impact Risk Matrix, and report export controls."
          />
        </figure>
      </div>

      <div class="hero-grid" style="margin-top:20px">
        <div>
          <p class="eyebrow">NSPA Scholarship Providers · Protect Data · Protect Decisions · Protect Operations</p>
          <h1 id="welcome-heading">Scholarship Security Audit Toolkit</h1>
          <p class="lead">
            Build an evidence-based assessment, inspect a live Likelihood × Impact Risk Matrix, track remediation ownership, and export redacted reports — without needing an enterprise security team.
          </p>
          <div class="cta-row">
            <button type="button" class="btn btn-primary" data-action="start-new">Start New Audit</button>
            <button type="button" class="btn btn-secondary" data-action="open-ssat">Open Encrypted .ssat Audit</button>
            <button type="button" class="btn btn-accent" data-action="start-demo">Try Fictional Practice Audit</button>
            ${
              state.doc
                ? '<button type="button" class="btn btn-outline" data-action="resume-active">Return to Current Audit</button>'
                : ''
            }
          </div>
          ${
            hasLocal
              ? `<div class="callout callout-info" style="margin-top:16px">
                   <strong>Encrypted local copy found in this browser.</strong>
                   <div class="btn-row" style="margin-top:8px">
                     <button type="button" class="btn btn-sm btn-primary" data-action="unlock-local">Unlock Local Copy</button>
                     <button type="button" class="btn btn-sm btn-outline" data-action="clear-local">Clear Local Encrypted Copy</button>
                   </div>
                 </div>`
              : ''
          }
        </div>
        <aside class="trust-box" aria-label="Important boundaries and privacy notice">
          <h2>Before you begin</h2>
          <ul>
            <li><strong>Audit assistant, not certification:</strong> Completing this tool never certifies an organization as NIST compliant, FERPA compliant, PCI DSS compliant, or secure.</li>
            <li><strong>Local-first processing:</strong> ${
              state.goServerMode
                ? 'Running on your local computer via the standalone Go server (127.0.0.1 only). No data leaves your device.'
                : 'Audit contents stay in your browser memory and are not intentionally uploaded. Static web hosting still receives ordinary HTTP request metadata (such as IP address).'
            }</li>
            <li><strong>References, not raw secrets:</strong> Do not paste SSNs, bank account numbers, applicant essays, donor financial details, or passwords. Record safe metadata references instead.</li>
            <li><strong>Accessibility:</strong> Built for keyboard-only navigation, screen readers, 200%/400% zoom, and grayscale-safe printing.</li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="section-block" aria-labelledby="pillars-heading">
      <h2 id="pillars-heading">Four Core Pillars of Scholarship Resilience</h2>
      <div class="step-grid">
        <article class="card pillar-card">
          <span class="step-num">01</span>
          <h3>Data Protection</h3>
          <p>Secure applicant, awardee, and donor information across portals, CRMs, shared drives, and backups.</p>
        </article>
        <article class="card pillar-card">
          <span class="step-num">02</span>
          <h3>Decision Integrity</h3>
          <p>Support fair, consistent, conflict-checked, and auditable eligibility, scoring, and disbursement decisions.</p>
        </article>
        <article class="card pillar-card">
          <span class="step-num">03</span>
          <h3>Governance &amp; Obligations</h3>
          <p>Collect verifiable facts for privacy, donor, and contract duties (legal applicability always flagged for counsel review).</p>
        </article>
        <article class="card pillar-card">
          <span class="step-num">04</span>
          <h3>Continuity Planning</h3>
          <p>Keep scholarship intake, notifications, and payments operating through deadline-day outages and incidents.</p>
        </article>
      </div>
    </section>

    ${
      !state.goServerMode
        ? `<section class="section-block card go-download-band" aria-labelledby="go-download-heading">
             <div class="section-header-row">
               <div>
                 <p class="eyebrow">Standalone Offline Desktop Executable · No Cloud Dependency</p>
                 <h2 id="go-download-heading">Download the Standalone Go Edition</h2>
                 <p class="muted">Prefer a single local executable that runs offline on <code>127.0.0.1</code> and saves encrypted <code>.ssat</code> files atomically to your computer? Download portable binaries and SHA-256 checksums from GitHub Releases.</p>
               </div>
               <div class="btn-row">
                 <a class="btn btn-primary" href="https://github.com/mguhlin/nspa/releases/tag/ssat-v1.0.0" target="_blank" rel="noopener noreferrer">Open GitHub Release (ssat-v1.0.0)</a>
               </div>
             </div>
             <div class="go-dl-grid">
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.0.0/ssat-windows-amd64.exe" rel="noopener noreferrer">Windows (64-bit .exe)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.0.0/ssat-darwin-arm64" rel="noopener noreferrer">macOS Apple Silicon (arm64)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.0.0/ssat-darwin-amd64" rel="noopener noreferrer">macOS Intel (amd64)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.0.0/ssat-linux-amd64" rel="noopener noreferrer">Linux (x64)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.0.0/ssat-linux-arm64" rel="noopener noreferrer">Linux (arm64)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.0.0/SHA256SUMS.txt" rel="noopener noreferrer">SHA256SUMS.txt</a>
             </div>
             <p class="muted" style="margin-top:10px;font-size:0.84rem">
               <strong>Unsigned prerelease notice:</strong> Verify the file hash against <code>SHA256SUMS.txt</code> before running. Windows SmartScreen or macOS Gatekeeper may show an unknown-publisher prompt for unsigned executables; never disable system security protections globally. Source code and reproducible build steps live in <code>audit/go/</code>.
             </p>
           </section>`
        : ''
    }

    <section class="section-block" aria-labelledby="minicourse-heading">
      <div class="section-header-row">
        <div>
          <p class="eyebrow">Onboarding Mini-Course · 10 Fictional Examples</p>
          <h2 id="minicourse-heading">What good evidence looks like</h2>
          <p class="muted">Compare verifiable proof against common weak assertions before you start scoring. All examples are fictional.</p>
        </div>
      </div>
      <div class="lessons-list">
        ${lessonsHtml}
      </div>
    </section>
  `;
}

export function bindWelcomeEvents(container: HTMLElement, store: Store, actions: WelcomeActions): void {
  container.querySelector('[data-action="start-new"]')?.addEventListener('click', () => {
    store.startNewAudit('');
  });
  container.querySelector('[data-action="open-ssat"]')?.addEventListener('click', () => {
    actions.onOpenSsatModal();
  });
  container.querySelector('[data-action="start-demo"]')?.addEventListener('click', () => {
    store.startDemoAudit();
  });
  container.querySelector('[data-action="resume-active"]')?.addEventListener('click', () => {
    store.navigate('dashboard');
  });
  container.querySelector('[data-action="unlock-local"]')?.addEventListener('click', () => {
    actions.onUnlockLocalCopy();
  });
  container.querySelector('[data-action="clear-local"]')?.addEventListener('click', () => {
    actions.onClearLocalCopy();
  });

  container.querySelectorAll<HTMLButtonElement>('[data-lesson-guess]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.lessonGuess || '';
      const guess = btn.dataset.guess || '';
      const feedback = container.querySelector<HTMLElement>(`#feedback-${CSS.escape(id)}`);
      if (!feedback) return;
      if (guess === '0') {
        feedback.textContent =
          'Correct: Weak assertions or unverified statements cannot earn Score 2. Score 0 or 1 until relevant current proof is reviewed.';
        feedback.className = 'practice-feedback text-ok';
      } else {
        feedback.textContent =
          'Not quite: Score 2 requires current, relevant reviewed evidence and a verification method/date — never an unverified claim or marketing badge.';
        feedback.className = 'practice-feedback text-warn';
      }
    });
  });
}
