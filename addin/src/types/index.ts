export interface EmailContext {
  senderEmail: string;
  subject: string;
  body: string;
  outlookMessageRef?: string;
  threadSummary?: string;
}

export interface DraftResponse {
  summary: string;
  draft_reply: string;
  missing_information: string[];
  confidence_notes?: string;
  customer_name?: string;
  customer_company?: string;
  draft_id?: string;
}

export interface CustomerCard {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  segment: string;
  preferred_tone: string;
  account_notes?: string;
  status: string;
}
