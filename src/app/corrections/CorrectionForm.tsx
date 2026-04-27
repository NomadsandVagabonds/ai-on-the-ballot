"use client";

import { useEffect, useState } from "react";

const CONTACT_EMAIL = "vinayasivakumar@berkeley.edu";

const ISSUE_OPTIONS = [
  "Export Control & Compute Governance",
  "Military & National Security AI",
  "AI Regulation Philosophy",
  "Data Centers",
  "Children's Online Safety",
  "Other / Biographical",
] as const;

type FormStatus = "idle" | "submitting" | "success" | "error";

/* ========================================
   Shared field + button styles
   ======================================== */

const fieldClass =
  "w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow";

const labelClass = "block text-sm font-semibold text-text-primary mb-1.5";

function SubmitButton({ status, label }: { status: FormStatus; label: string }) {
  return (
    <button
      type="submit"
      disabled={status === "submitting"}
      className="w-full inline-flex items-center justify-center rounded-lg bg-navy text-white font-semibold px-6 py-3 transition-colors disabled:opacity-60 disabled:cursor-not-allowed hover:bg-[var(--navy-hover)]"
    >
      {status === "submitting" ? "Submitting..." : label}
    </button>
  );
}

function SuccessPanel({
  onReset,
  label,
}: {
  onReset: () => void;
  label: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-50 mb-4">
        <svg
          className="w-6 h-6 text-stance-support"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <p className="text-lg font-medium text-text-primary mb-2">
        Your email client should have opened.
      </p>
      <p className="text-text-muted mb-6">
        Please review and send the pre-filled message to complete your submission. We review submissions regularly and will follow up if needed.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="text-accent-primary hover:text-accent-primary-hover font-medium transition-colors"
      >
        {label}
      </button>
    </div>
  );
}

function openMailto(subject: string, bodyLines: (string | false | null | undefined)[]): void {
  const body = bodyLines.filter(Boolean).join("\n");
  const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = url;
}

/* ========================================
   Form 1 — Submit Correction (original)
   ======================================== */

export function CorrectionForm() {
  const [candidateName, setCandidateName] = useState("");
  const [issue, setIssue] = useState("");
  const [proposedCorrection, setProposedCorrection] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [submitterEmail, setSubmitterEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setCandidateName("");
    setIssue("");
    setProposedCorrection("");
    setSourceUrl("");
    setSubmitterEmail("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const subject = `[Correction] ${candidateName.trim()} — ${issue.trim()}`;
      openMailto(subject, [
        `Candidate: ${candidateName.trim()}`,
        `Issue: ${issue.trim()}`,
        ``,
        `Proposed correction:`,
        proposedCorrection.trim(),
        ``,
        sourceUrl.trim() && `Source: ${sourceUrl.trim()}`,
        submitterEmail.trim() && `Submitter email: ${submitterEmail.trim()}`,
      ]);
      setStatus("success");
      resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to open mail client"
      );
    }
  };

  if (status === "success") {
    return (
      <SuccessPanel
        onReset={() => setStatus("idle")}
        label="Submit another correction"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
          Submit a Correction
        </h3>
        <p className="text-sm text-text-secondary">
          Flag an inaccuracy in candidate data, stance coding, or sourcing. All submissions are reviewed before changes are made.
        </p>
      </div>

      <div>
        <label htmlFor="candidate-name" className={labelClass}>
          Candidate name <span className="text-stance-oppose">*</span>
        </label>
        <input
          id="candidate-name"
          type="text"
          required
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g., Jane Smith"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="issue-category" className={labelClass}>
          Issue category <span className="text-stance-oppose">*</span>
        </label>
        <select
          id="issue-category"
          required
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className={fieldClass}
        >
          <option value="">Select an issue...</option>
          {ISSUE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="proposed-correction" className={labelClass}>
          Proposed correction <span className="text-stance-oppose">*</span>
        </label>
        <textarea
          id="proposed-correction"
          required
          rows={4}
          value={proposedCorrection}
          onChange={(e) => setProposedCorrection(e.target.value)}
          placeholder="Describe the inaccuracy and what the correct information should be..."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="source-url" className={labelClass}>
          Supporting source URL{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="source-url"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://..."
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="submitter-email" className={labelClass}>
          Your email{" "}
          <span className="text-text-muted font-normal">
            (optional — for follow-up only, not published)
          </span>
        </label>
        <input
          id="submitter-email"
          type="email"
          value={submitterEmail}
          onChange={(e) => setSubmitterEmail(e.target.value)}
          placeholder="you@example.com"
          className={fieldClass}
        />
      </div>

      {status === "error" && (
        <div
          className="rounded-lg border border-stance-oppose/20 bg-stance-oppose/5 px-4 py-3 text-sm text-stance-oppose"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <SubmitButton status={status} label="Submit Correction" />
    </form>
  );
}

/* ========================================
   Form 2 — Candidate Clarification
   ======================================== */

export function ClarificationForm() {
  const [candidateName, setCandidateName] = useState("");
  const [role, setRole] = useState("");
  const [issue, setIssue] = useState("");
  const [clarification, setClarification] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setCandidateName("");
    setRole("");
    setIssue("");
    setClarification("");
    setSourceUrl("");
    setEmail("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const subject = `[Clarification] ${candidateName.trim()} — ${issue || "General"}`;
      openMailto(subject, [
        `Candidate: ${candidateName.trim()}`,
        role && `Submitted by: ${role}`,
        `Topic: ${issue || "(unspecified)"}`,
        ``,
        `Clarification:`,
        clarification.trim(),
        ``,
        sourceUrl.trim() && `Primary source: ${sourceUrl.trim()}`,
        email.trim() && `Contact email: ${email.trim()}`,
      ]);
      setStatus("success");
      resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to open mail client"
      );
    }
  };

  if (status === "success") {
    return (
      <SuccessPanel
        onReset={() => setStatus("idle")}
        label="Submit another clarification"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
          Candidate Clarification
        </h3>
        <p className="text-sm text-text-secondary">
          Are you a candidate or campaign staff? Use this form to clarify or add context to a recorded position. Verification may be requested before publication.
        </p>
      </div>

      <div>
        <label htmlFor="clar-candidate" className={labelClass}>
          Candidate name <span className="text-stance-oppose">*</span>
        </label>
        <input
          id="clar-candidate"
          type="text"
          required
          value={candidateName}
          onChange={(e) => setCandidateName(e.target.value)}
          placeholder="e.g., Jane Smith"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="clar-role" className={labelClass}>
          Your role{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="clar-role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g., Candidate, Campaign Manager, Press Secretary"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="clar-issue" className={labelClass}>
          Topic{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <select
          id="clar-issue"
          value={issue}
          onChange={(e) => setIssue(e.target.value)}
          className={fieldClass}
        >
          <option value="">Select an issue (optional)...</option>
          {ISSUE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="clar-text" className={labelClass}>
          Clarification <span className="text-stance-oppose">*</span>
        </label>
        <textarea
          id="clar-text"
          required
          rows={5}
          value={clarification}
          onChange={(e) => setClarification(e.target.value)}
          placeholder="Provide the clarified position or additional context, ideally with links to primary sources."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="clar-source" className={labelClass}>
          Primary source URL{" "}
          <span className="text-text-muted font-normal">(recommended)</span>
        </label>
        <input
          id="clar-source"
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="Link to speech, press release, policy page, etc."
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="clar-email" className={labelClass}>
          Contact email{" "}
          <span className="text-text-muted font-normal">
            (required for verification)
          </span>
        </label>
        <input
          id="clar-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@campaign.com"
          className={fieldClass}
        />
      </div>

      {status === "error" && (
        <div
          className="rounded-lg border border-stance-oppose/20 bg-stance-oppose/5 px-4 py-3 text-sm text-stance-oppose"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <SubmitButton status={status} label="Submit Clarification" />
    </form>
  );
}

/* ========================================
   Form 3 — Ask a Question
   ======================================== */

export function QuestionForm() {
  const [question, setQuestion] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const resetForm = () => {
    setQuestion("");
    setName("");
    setEmail("");
    setAffiliation("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const subject = `[Question] ${name ? `from ${name}` : "General question"}`;
      openMailto(subject, [
        name && `From: ${name}`,
        affiliation && `Affiliation: ${affiliation}`,
        email.trim() && `Email: ${email.trim()}`,
        ``,
        `Question:`,
        question.trim(),
      ]);
      setStatus("success");
      resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to open mail client"
      );
    }
  };

  if (status === "success") {
    return (
      <SuccessPanel
        onReset={() => setStatus("idle")}
        label="Ask another question"
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="font-display text-2xl font-bold text-text-primary mb-2">
          Ask a Question
        </h3>
        <p className="text-sm text-text-secondary">
          Have a question about the data, methodology, or coverage decisions? We&apos;ll respond as time allows.
        </p>
      </div>

      <div>
        <label htmlFor="q-text" className={labelClass}>
          Your question <span className="text-stance-oppose">*</span>
        </label>
        <textarea
          id="q-text"
          required
          rows={5}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask about methodology, data coverage, coding decisions, or anything else."
          className={`${fieldClass} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="q-name" className={labelClass}>
          Name{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="q-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Optional"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="q-email" className={labelClass}>
          Email{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="q-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="If you'd like a direct response"
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="q-affiliation" className={labelClass}>
          Affiliation{" "}
          <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <input
          id="q-affiliation"
          type="text"
          value={affiliation}
          onChange={(e) => setAffiliation(e.target.value)}
          placeholder="e.g., Journalist, Academic researcher, Voter"
          className={fieldClass}
        />
      </div>

      {status === "error" && (
        <div
          className="rounded-lg border border-stance-oppose/20 bg-stance-oppose/5 px-4 py-3 text-sm text-stance-oppose"
          role="alert"
        >
          {errorMessage}
        </div>
      )}

      <SubmitButton status={status} label="Submit" />

      <p className="text-xs text-text-muted leading-relaxed">
        Submissions are reviewed monthly. This project does not commit to real-time responses. For urgent corrections, link to a primary source in your submission.
      </p>
    </form>
  );
}

/* ========================================
   Tab wrapper
   ======================================== */

type TabKey = "correction" | "clarification" | "question";

const TABS: { key: TabKey; label: string }[] = [
  { key: "correction", label: "Submit Correction" },
  { key: "clarification", label: "Candidate Clarification" },
  { key: "question", label: "Ask a Question" },
];

const VALID_TABS: TabKey[] = ["correction", "clarification", "question"];

export function FeedbackTabs() {
  const [active, setActive] = useState<TabKey>("correction");

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as TabKey;
    if (VALID_TABS.includes(hash)) setActive(hash);

    const onHashChange = () => {
      const next = window.location.hash.replace("#", "") as TabKey;
      if (VALID_TABS.includes(next)) setActive(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div>
      {/* Tab buttons */}
      <div
        role="tablist"
        aria-label="Feedback type"
        className="flex flex-wrap gap-1 p-1 bg-bg-elevated rounded-lg border border-border mb-6"
      >
        {TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              onClick={() => {
                setActive(tab.key);
                if (typeof window !== "undefined") {
                  history.replaceState(null, "", `#${tab.key}`);
                }
              }}
              className={`flex-1 min-w-[140px] px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? "bg-bg-surface text-text-primary shadow-sm"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Active panel */}
      <div className="bg-bg-surface border border-border rounded-lg p-6 sm:p-8">
        {active === "correction" && <CorrectionForm />}
        {active === "clarification" && <ClarificationForm />}
        {active === "question" && <QuestionForm />}
      </div>
    </div>
  );
}
