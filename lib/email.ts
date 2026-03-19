"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@ideaportal.com"; 

export async function sendNewApplicationEmail(taskTitle: string, applicantEmail: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Missing RESEND_API_KEY. Skipping email notification.");
    return { success: false, error: "Missing API Key" };
  }

  try {
    const data = await resend.emails.send({
      from: "Idea Portal <onboarding@resend.dev>",
      to: ADMIN_EMAIL,
      subject: "New Project Application Received",
      text: `A new student has applied for a task.

Project: ${taskTitle}
Applicant: ${applicantEmail}

Please review the application in the admin dashboard.`,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send new application email:", error);
    return { success: false, error };
  }
}

export async function sendApplicationDecisionEmail(
  taskTitle: string,
  applicantEmail: string,
  status: "accepted" | "rejected"
) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("Missing RESEND_API_KEY. Skipping email notification.");
    return { success: false, error: "Missing API Key" };
  }

  // NOTE: onboarding@resend.dev can only deliver to the Resend account's own email.
  // Routing to admin inbox as a workaround. Swap `to` to `applicantEmail`
  // once you verify a sender domain at resend.com/domains.
  const subject =
    status === "accepted"
      ? `[Action] Application Accepted — notify ${applicantEmail}`
      : `[FYI] Application Rejected — ${applicantEmail}`;

  const body =
    status === "accepted"
      ? `A student has been accepted. Please contact them to begin collaboration.\n\nStudent: ${applicantEmail}\nProject: ${taskTitle}`
      : `A student's application was rejected.\n\nStudent: ${applicantEmail}\nProject: ${taskTitle}`;

  try {
    const data = await resend.emails.send({
      from: "Idea Portal <onboarding@resend.dev>",
      to: ADMIN_EMAIL, // swap to `applicantEmail` once you have a verified sender domain
      subject,
      text: body,
    });

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send application decision email:", error);
    return { success: false, error };
  }
}
