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
  // implemented in Task 2
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
