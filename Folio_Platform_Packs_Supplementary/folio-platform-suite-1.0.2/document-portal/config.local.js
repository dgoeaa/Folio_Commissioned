/* NITDA document portal — endpoint configuration.
 *
 * PROVISIONED INTO THIS PACKAGE by scripts/package.mjs.
 *   build 77c26e7b4c3addb6   posture demo   2026-01-01T00:00:00.000Z
 *
 * ⚠  This is the PUBLIC portal. Every URL below is delivered to every visitor's browser
 * and is readable by anyone who fetches a static asset from the site. Configure only
 * endpoints whose flows are built to be invoked by an anonymous stranger: each must
 * validate its own input, rate-limit its own callers, return only what that caller is
 * entitled to see, and be rotatable on a schedule.
 *
 * With SUBMISSION empty the portal stays in DEMO MODE — everything stays on the device and
 * nothing is transmitted, which is the safe failure for a public channel.
 *
 * MERGED, NOT ASSIGNED — injecting window.PF_CONFIG before this file loads is a supported
 * way to supply endpoints, so anything already set must win.
 */
window.PF_CONFIG = window.PF_CONFIG || {};
window.PF_CONFIG.endpoints = Object.assign({
    SUBMISSION:     "",
    UPLOAD:         "",
    STATUS:         "",
    SUPPORT:        "",
    VERIFY:         "",
    VERIFY_CONFIRM: "",
    WRITEBACK:      "",
}, window.PF_CONFIG.endpoints);
