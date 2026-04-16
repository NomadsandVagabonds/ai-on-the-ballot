"use client";

import { useState } from "react";
import type { CorrectionSubmission } from "@/types/domain";

const ISSUE_OPTIONS = [
  "Export Control & Compute Governance",
  "Military & National Security AI",
  "AI Regulation Philosophy",
  "Data Centers",
  "Children's Online Safety",
] as const;

type FormStatus = "idle" | "submitting" | "success" | "error";

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const submission: CorrectionSubmission = {
      candidate_name: candidateName.trim(),
      issue: issue.trim(),
      proposed_correction: proposedCorrection.trim(),
      ...(sourceUrl.trim() && { source_url: sourceUrl.trim() }),
      ...(submitterEmail.trim() && { submitter_email: submitterEmail.trim() }),
    };

    try {
      const response = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit correction");
      }

      setStatus("success");
      resetForm();
    } catch (err) {
      setStatus("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Failed to submit correction"
      );
    }
  };

  return (
    <div className="bg-bg-surface border border-border rounded-lg p-6 sm:p-8">
      {status === "success" ? (
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
            Thank you. Your correction has been submitted for review.
          </p>
          <p className="text-text-muted mb-6">
            We review corrections regularly and will update the dataset if
            warranted.
          </p>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="text-accent-primary hover:text-accent-primary-hover font-medium transition-colors"
          >
            Submit another correction
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Candidate Name */}
          <div>
            <label
              htmlFor="candidate-name"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Candidate name <span className="text-stance-oppose">*</span>
            </label>
            <input
              id="candidate-name"
              type="text"
              required
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              placeholder="e.g., Jane Smith"
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
            />
          </div>

          {/* Issue Category */}
          <div>
            <label
              htmlFor="issue-category"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Issue category <span className="text-stance-oppose">*</span>
            </label>
            <select
              id="issue-category"
              required
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
            >
              <option value="">Select an issue...</option>
              {ISSUE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Proposed Correction */}
          <div>
            <label
              htmlFor="proposed-correction"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Proposed correction{" "}
              <span className="text-stance-oppose">*</span>
            </label>
            <textarea
              id="proposed-correction"
              required
              rows={4}
              value={proposedCorrection}
              onChange={(e) => setProposedCorrection(e.target.value)}
              placeholder="Describe the inaccuracy and what the correct information should be..."
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow resize-y"
            />
          </div>

          {/* Source URL */}
          <div>
            <label
              htmlFor="source-url"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
              Supporting source URL{" "}
              <span className="text-text-muted font-normal">(optional)</span>
            </label>
            <input
              id="source-url"
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
            />
          </div>

          {/* Submitter Email */}
          <div>
            <label
              htmlFor="submitter-email"
              className="block text-sm font-medium text-text-primary mb-1.5"
            >
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
              className="w-full rounded-lg border border-border bg-bg-surface px-4 py-2.5 text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-transparent transition-shadow"
            />
          </div>

          {/* Error Message */}
          {status === "error" && (
            <div
              className="rounded-lg border border-stance-oppose/20 bg-stance-oppose/5 px-4 py-3 text-sm text-stance-oppose"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === "submitting"}
            className="inline-flex items-center justify-center rounded-lg bg-accent-primary hover:bg-accent-primary-hover text-white font-medium px-6 py-2.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status === "submitting" ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Correction"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
