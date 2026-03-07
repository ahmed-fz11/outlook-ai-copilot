/**
 * Office.js helpers for reading the current email in Outlook.
 */

import type { EmailContext } from "../types";

export async function getCurrentEmail(): Promise<EmailContext | null> {
  return new Promise((resolve) => {
    const item = Office.context.mailbox?.item;
    if (!item) {
      resolve(null);
      return;
    }

    const senderEmail = item.from?.emailAddress ?? "";
    const subject = item.subject ?? "";

    item.body.getAsync(Office.CoercionType.Text, (result) => {
      const body = result.status === Office.AsyncResultStatus.Succeeded ? result.value : "";
      resolve({
        senderEmail,
        subject,
        body,
        outlookMessageRef: item.itemId ?? undefined,
      });
    });
  });
}
