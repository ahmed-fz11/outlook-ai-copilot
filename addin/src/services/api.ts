/**
 * Backend API client for the FastAPI copilot service.
 */

import type { EmailContext, DraftResponse } from "../types";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("sb-access-token") ?? "";

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }

  return res.json();
}

export async function generateDraft(
  email: EmailContext,
  tone: string = "professional"
): Promise<DraftResponse> {
  return request<DraftResponse>("/api/drafts/generate", {
    method: "POST",
    body: JSON.stringify({
      email: {
        sender_email: email.senderEmail,
        subject: email.subject,
        body: email.body,
        outlook_message_ref: email.outlookMessageRef,
        thread_summary: email.threadSummary,
      },
      tone,
    }),
  });
}

export async function generateDraftMock(
  email: EmailContext,
  tone: string = "professional"
): Promise<DraftResponse> {
  return request<DraftResponse>("/api/drafts/generate-mock", {
    method: "POST",
    body: JSON.stringify({
      email: {
        sender_email: email.senderEmail,
        subject: email.subject,
        body: email.body,
        outlook_message_ref: email.outlookMessageRef,
        thread_summary: email.threadSummary,
      },
      tone,
    }),
  });
}
