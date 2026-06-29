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
  // implemented in Task 3
})();

// ── NODE.JS EXPORT (Tampermonkey has no `module`, this is a no-op there) ───────
if (typeof module !== 'undefined') {
  module.exports = { parseApolloBlob };
}
