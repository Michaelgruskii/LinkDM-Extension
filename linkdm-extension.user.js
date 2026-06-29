// ==UserScript==
// @name         LinkDM Extension
// @namespace    https://github.com/
// @version      1.0.0
// @description  Parses Apollo copied messages into selectable variants on LinkedIn and Sales Nav
// @author       Michael Gruskin
// @match        https://www.linkedin.com/in/*
// @match        https://www.linkedin.com/sales/lead/*
// @match        https://www.linkedin.com/sales/people/*
// @grant        GM_setClipboard
// @grant        GM_addStyle
// @run-at       document-idle
// ==/UserScript==

// ── PARSER (pure function, no browser APIs — also used by Jest tests) ──────────
function parseApolloBlob(text) {
  if (!text || typeof text !== 'string') return null;

  const normalized = text.replace(/\r\n/g, '\n');

  const msg1Match = normalized.match(/Message 1:\s*\n([\s\S]*?)(?=\nMessage 2:)/i);
  const msg2Match = normalized.match(/Message 2:\s*\n([\s\S]*?)(?=\nInMail|\nInmail)/i);
  const inmailMatch = normalized.match(/InMail[:\s]*([\s\S]*)$/i);

  const message1 = msg1Match ? msg1Match[1].trim() : null;
  const message2 = msg2Match ? msg2Match[1].trim() : null;

  let subject = null;
  let body = null;

  if (inmailMatch) {
    const raw = inmailMatch[1].trim();
    const blankIdx = raw.search(/\n\s*\n/);

    if (blankIdx !== -1) {
      const subjectLine = raw.substring(0, blankIdx).trim();
      body = raw.substring(blankIdx).trim();
      subject = subjectLine.replace(/^Subject:\s*/i, '').trim();
    } else {
      subject = raw.replace(/^Subject:\s*/i, '').trim();
      body = '';
    }
  }

  if (!message1 && !message2 && !subject) return null;

  return { message1, message2, inmail: { subject, body } };
}

// ── BROWSER RUNTIME ────────────────────────────────────────────────────────────
(function () {
  'use strict';
  if (typeof window === 'undefined') return;

  // ── PAGE DETECTION ──────────────────────────────────────
  function isProfilePage() {
    return /linkedin\.com\/in\/|linkedin\.com\/sales\/(lead|people)\//.test(window.location.href);
  }

  function isSalesNav() {
    return window.location.href.includes('linkedin.com/sales/');
  }

  // ── CLIPBOARD ───────────────────────────────────────────
  async function readClipboard() {
    try {
      return await navigator.clipboard.readText();
    } catch {
      return null;
    }
  }

  function copyToClipboard(text) {
    if (typeof GM_setClipboard !== 'undefined') {
      GM_setClipboard(text);
    } else {
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  // ── STYLES ──────────────────────────────────────────────
  function injectStyles() {
    GM_addStyle(`
      #linkdm-btn {
        position: fixed; bottom: 24px; right: 24px; z-index: 99999;
        background: #0a66c2; color: #fff; border: none; border-radius: 8px;
        padding: 10px 16px; font-family: -apple-system, sans-serif;
        font-size: 13px; font-weight: 600; cursor: pointer;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      }
      #linkdm-btn:hover { background: #004182; }
      #linkdm-panel {
        position: fixed; bottom: 72px; right: 24px; z-index: 99999;
        background: #fff; border: 1px solid #d0d5dd; border-radius: 10px;
        padding: 16px; width: 360px; box-shadow: 0 8px 24px rgba(0,0,0,0.15);
        font-family: -apple-system, sans-serif; font-size: 13px; display: none;
      }
      .linkdm-section { margin-bottom: 14px; border-bottom: 1px solid #f0f0f0; padding-bottom: 14px; }
      .linkdm-section:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
      .linkdm-label { font-weight: 700; font-size: 11px; text-transform: uppercase; color: #666; margin-bottom: 6px; }
      .linkdm-subject { font-size: 11px; color: #888; margin-bottom: 4px; }
      .linkdm-text {
        color: #111; line-height: 1.4; margin-bottom: 8px;
        max-height: 80px; overflow-y: auto; font-size: 12px;
        background: #f8f9fb; border-radius: 6px; padding: 8px;
      }
      .linkdm-copy {
        background: #0a66c2; color: #fff; border: none; border-radius: 6px;
        padding: 5px 12px; font-size: 12px; font-weight: 600; cursor: pointer; margin-right: 6px;
      }
      .linkdm-copy:hover { background: #004182; }
      .linkdm-copy.done { background: #057642; }
      .linkdm-error { color: #c00; font-size: 12px; padding: 8px; }
      #linkdm-close {
        position: absolute; top: 10px; right: 12px; cursor: pointer;
        font-size: 18px; color: #999; background: none; border: none; line-height: 1;
      }
    `);
  }

  // ── DOM HELPERS ─────────────────────────────────────────
  function makeCopyBtn(text, label) {
    const btn = document.createElement('button');
    btn.className = 'linkdm-copy';
    btn.textContent = label || 'Copy';
    btn.addEventListener('click', () => {
      copyToClipboard(text);
      btn.textContent = 'Copied!';
      btn.classList.add('done');
      setTimeout(() => { btn.textContent = label || 'Copy'; btn.classList.remove('done'); }, 1500);
    });
    return btn;
  }

  function makeSection(labelText, bodyText, subHeaderText) {
    const section = document.createElement('div');
    section.className = 'linkdm-section';

    const label = document.createElement('div');
    label.className = 'linkdm-label';
    label.textContent = labelText;
    section.appendChild(label);

    if (subHeaderText) {
      const sub = document.createElement('div');
      sub.className = 'linkdm-subject';
      sub.textContent = subHeaderText;
      section.appendChild(sub);
    }

    const body = document.createElement('div');
    body.className = 'linkdm-text';
    body.textContent = bodyText || '(empty)';
    section.appendChild(body);

    return section;
  }

  function renderParsed(panel, parsed) {
    const close = panel.querySelector('#linkdm-close');
    panel.innerHTML = '';
    panel.appendChild(close);

    if (parsed.message1) {
      const s = makeSection('Message 1 — just connected', parsed.message1);
      s.appendChild(makeCopyBtn(parsed.message1));
      panel.appendChild(s);
    }

    if (parsed.message2) {
      const s = makeSection('Message 2 — follow-up', parsed.message2);
      s.appendChild(makeCopyBtn(parsed.message2));
      panel.appendChild(s);
    }

    if (parsed.inmail.subject || parsed.inmail.body) {
      const s = makeSection(
        'InMail',
        parsed.inmail.body,
        `Subject: ${parsed.inmail.subject || '(none)'}`
      );
      s.appendChild(makeCopyBtn(parsed.inmail.subject || '', 'Copy subject'));
      s.appendChild(makeCopyBtn(parsed.inmail.body || '', 'Copy body'));
      panel.appendChild(s);
    }
  }

  function renderError(panel, msg) {
    const close = panel.querySelector('#linkdm-close');
    panel.innerHTML = '';
    panel.appendChild(close);
    const err = document.createElement('div');
    err.className = 'linkdm-error';
    err.textContent = msg;
    panel.appendChild(err);
  }

  // ── INIT ────────────────────────────────────────────────
  function init() {
    if (!isProfilePage()) return;

    injectStyles();

    const btn = document.createElement('button');
    btn.id = 'linkdm-btn';
    btn.textContent = isSalesNav() ? 'LinkDM (InMail)' : 'LinkDM';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'linkdm-panel';
    const closeBtn = document.createElement('button');
    closeBtn.id = 'linkdm-close';
    closeBtn.textContent = '×';
    closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
    panel.appendChild(closeBtn);
    document.body.appendChild(panel);

    btn.addEventListener('click', async () => {
      if (panel.style.display === 'block') {
        panel.style.display = 'none';
        return;
      }

      const clipText = await readClipboard();
      if (!clipText) {
        renderError(panel, 'Could not read clipboard. Copy the Apollo message first, then click LinkDM.');
        panel.style.display = 'block';
        return;
      }

      const parsed = parseApolloBlob(clipText);
      if (!parsed) {
        renderError(panel, 'No Apollo message detected. Copy the message from Apollo first.');
        panel.style.display = 'block';
        return;
      }

      renderParsed(panel, parsed);
      panel.style.display = 'block';
    });
  }

  init();
})();

// ── NODE.JS EXPORT (Tampermonkey has no `module`, this is a no-op there) ───────
if (typeof module !== 'undefined') {
  module.exports = { parseApolloBlob };
}
