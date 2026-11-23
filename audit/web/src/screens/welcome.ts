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
      <div class="hero-grid">
        <div class="hero-copy">
          <p class="eyebrow">NSPA Scholarship Providers · Protect Data · Protect Decisions · Protect Operations</p>
          <h1 id="welcome-heading">Scholarship Security Audit Toolkit</h1>
          <p class="lead">
            Start with five everyday questions. Find your biggest gaps, make a clear action plan, and save a summary to share with your team.
          </p>
          <div class="cta-row">
            <button type="button" class="btn btn-primary" data-action="start-new">Start New Audit</button>
            <button type="button" class="btn btn-secondary" data-action="open-ssat">Open saved audit</button>
            <button type="button" class="btn btn-accent" data-action="start-demo">Try a fictional example</button>
            ${!state.goServerMode ? '<a class="btn btn-outline" href="#go-download-heading">Get the offline app</a>' : ''}
            ${
              state.doc
                ? '<button type="button" class="btn btn-outline" data-action="resume-active">Return to my roadmap</button>'
                : ''
            }
          </div>
          ${
            hasLocal
              ? `<div class="callout callout-info" style="margin-top:12px">
                   <strong>Encrypted local copy found in this browser.</strong>
                   <div class="btn-row" style="margin-top:8px">
                     <button type="button" class="btn btn-sm btn-primary" data-action="unlock-local">Unlock Local Copy</button>
                     <button type="button" class="btn btn-sm btn-outline" data-action="clear-local">Clear Local Encrypted Copy</button>
                   </div>
                 </div>`
              : ''
          }
        </div>
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
      </div>

      <aside class="trust-strip" aria-label="Important boundaries and privacy notice">
        <div><strong>Not a certification:</strong> Never certifies NIST, FERPA, PCI DSS, or legal compliance.</div>
        <div><strong>Local-first:</strong> ${
          state.goServerMode
            ? 'All audit processing stays on your computer.'
            : 'Processed in browser memory; static host sees ordinary HTTP metadata only.'
        }</div>
        <div><strong>References only:</strong> Never paste raw SSNs, essays, bank numbers, or passwords.</div>
        <div><strong>Keep your work:</strong> Save an encrypted audit file before closing. Keep its passphrase somewhere safe.</div>
      </aside>
    </section>

    <section class="section-block welcome-route" aria-labelledby="route-heading">
      <div><h2 id="route-heading">A small start. A useful plan.</h2><p>You can stop after the first five questions with a short list of things to fix, or work through all 30 questions with your team.</p></div>
      <ol><li><strong>Answer five questions</strong><span>Use what you know. Leave unknowns open.</span></li><li><strong>Choose what to fix</strong><span>Give each task an owner and a deadline.</span></li><li><strong>Check and share</strong><span>Keep proof, share a summary, and save your audit.</span></li></ol>
    </section>

    ${
      !state.goServerMode
        ? `<section class="section-block card go-download-band" aria-labelledby="go-download-heading">
             <div class="section-header-row">
               <div>
                 <p class="eyebrow">Work without internet</p>
                 <h2 id="go-download-heading">Download the offline desktop app</h2>
                 <p class="muted">Open SSAT in its own app window. The questions, examples, encryption, and reports are included. No browser window, account, or internet connection is needed to do your audit.</p>
               </div>
               <div class="btn-row">
                 <a class="btn btn-primary" href="https://github.com/mguhlin/nspa/releases/tag/ssat-v1.1.3" target="_blank" rel="noopener noreferrer">Downloads and setup instructions</a>
               </div>
             </div>
             <div class="go-dl-grid">
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.1.3/ssat-desktop-windows-amd64.zip" rel="noopener noreferrer">Windows (64-bit)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.1.3/ssat-desktop-macos-arm64.zip" rel="noopener noreferrer">Mac (Apple Silicon)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.1.3/ssat-desktop-macos-amd64.zip" rel="noopener noreferrer">Mac (Intel)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.1.3/ssat-desktop-linux-amd64.tar.gz" rel="noopener noreferrer">Linux (x64)</a>
               <a class="btn btn-outline" href="https://github.com/mguhlin/nspa/releases/download/ssat-v1.1.3/SHA256SUMS.txt" rel="noopener noreferrer">SHA256SUMS.txt</a>
             </div>
             <p class="muted" style="margin-top:10px;font-size:0.84rem">
               <strong>Unsigned prerelease notice:</strong> Verify the file hash against <code>SHA256SUMS.txt</code> before running. Windows SmartScreen or macOS Gatekeeper may show an unknown-publisher prompt for unsigned executables; never disable system security protections globally. Windows includes Microsoft’s offline WebView2 installer for computers that need it. Linux requires GTK 3 and WebKitGTK 4.1 to be installed before disconnecting. These are unsigned preview builds; Mac and Windows device testing is still pending.
             </p>
           </section>`
        : ''
    }

    <details class="section-block card"><summary>Optional learning: what good evidence looks like</summary><section aria-labelledby="minicourse-heading">
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
    </section></details>
  `;
}

export function bindWelcomeEvents(container: HTMLElement, store: Store, actions: WelcomeActions): void {
  container.querySelector('[data-action="start-new"]')?.addEventListener('click', () => {
    if (store.get().doc && store.get().dirty && !window.confirm('Start over and discard unsaved changes? Save audit first if you want to keep them.')) return;
    store.startNewAudit('');
  });
  container.querySelector('[data-action="open-ssat"]')?.addEventListener('click', () => {
    actions.onOpenSsatModal();
  });
  container.querySelector('[data-action="start-demo"]')?.addEventListener('click', () => {
    if (store.get().doc && store.get().dirty && !window.confirm('Replace your unsaved audit with a fictional example?')) return;
    store.startDemoAudit();
  });
  container.querySelector('[data-action="resume-active"]')?.addEventListener('click', () => {
    store.navigate('roadmap');
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
