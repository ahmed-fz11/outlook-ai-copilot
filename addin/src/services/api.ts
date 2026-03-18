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

export interface SavedDraft {
  id: string;
  generated_draft: string | null;
  missing_info_json: string[] | null;
  subject: string | null;
  model_name: string;
  token_input: number;
  token_output: number;
  estimated_cost: number;
  created_at: string;
}

export interface CustomerInfo {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  segment: string;
  preferred_tone: string;
  account_notes: string | null;
  status: string;
}

export async function lookupCustomer(senderEmail: string): Promise<CustomerInfo | null> {
  try {
    const params = new URLSearchParams({ sender_email: senderEmail });
    return await request<CustomerInfo | null>(`/api/customers/lookup?${params}`);
  } catch {
    return null;
  }
}

export async function fetchDraftHistory(senderEmail: string): Promise<SavedDraft[]> {
  const params = new URLSearchParams({ sender_email: senderEmail, limit: "20" });
  return request<SavedDraft[]>(`/api/drafts/history?${params}`);
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
