"use client";

import { useEffect, useState } from "react";

/**
 * Small dismissible WIP notice in the lower-right corner. Invites viewers
 * to a Google Form for feedback. Dismissal is remembered in localStorage.
 *
 * Naming is deliberately neutral (`site-notice`, `feedback-notice`) and the
 * element is SSR'd as part of the normal DOM — no third-party script, no
 * iframe, no class names like "popup"/"modal"/"promo"/"ad" that trip
 * content-blocker heuristics.
 */

const STORAGE_KEY = "aotb.wip-notice.dismissed";
const SHOW_DELAY_MS = 1500;
const FEEDBACK_URL =
  "https://docs.google.com/forms/d/1PO-LmF7fmZNSiMoyqeL3N5KRN4oThdp2qVS3xHVoVf8/viewform";

export function FeedbackNotice() {
  // Start closed; flip to open after the mount delay unless the user has
  // already dismissed it in a prior session.
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let dismissed = false;
    try {
      dismissed = window.localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // ignore — localStorage may be blocked (private mode, sandboxed iframe)
    }
    if (dismissed) return;
    const t = window.setTimeout(() => {
      setOpen(true);
      setReady(true);
    }, SHOW_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  if (!ready || !open) return null;

  return (
    <aside
      className="site-notice"
      aria-label="Preview feedback"
      role="complementary"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Close notice"
        className="site-notice__close"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M3 3l8 8M11 3l-8 8" />
        </svg>
      </button>

      <p className="site-notice__kicker">Preview build</p>
      <p className="site-notice__body">
        Thank you for beta testing! This project goes live on{" "}
        <strong className="site-notice__mark">Monday, April 27</strong>
        , and we would greatly appreciate your feedback.
      </p>
      <div className="site-notice__actions">
        <a
          href={FEEDBACK_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="site-notice__cta"
          onClick={dismiss}
        >
          Share feedback
          <span aria-hidden="true">→</span>
        </a>
        <button
          type="button"
          onClick={dismiss}
          className="site-notice__dismiss"
        >
          Not now
        </button>
      </div>
    </aside>
  );
}
