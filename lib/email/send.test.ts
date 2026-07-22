import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReportData } from "@/lib/report/getReportData";

const sendMock = vi.fn();

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

const report: ReportData = {
  sessionId: "session_123",
  who5: { percentageScore: 80, description: "Good." },
  perma: [],
  permaOverallPercentageScore: 80,
  insights: [],
  aiSummary: "A safe summary.",
  aiSummarySource: "ai",
  belowThreshold: false,
  isFirstAssessment: true,
  previous: null,
};

describe("sendResultsEmail", () => {
  const originalApiKey = process.env.RESEND_API_KEY;

  afterEach(() => {
    process.env.RESEND_API_KEY = originalApiKey;
    sendMock.mockReset();
  });

  it("fails gracefully when RESEND_API_KEY is not set", async () => {
    delete process.env.RESEND_API_KEY;
    const { sendResultsEmail } = await import("./send");
    const result = await sendResultsEmail(
      "student@example.com",
      report,
      "https://saati.app/r/1",
    );
    expect(result.success).toBe(false);
  });

  it("returns success when Resend accepts the send", async () => {
    process.env.RESEND_API_KEY = "test-key";
    sendMock.mockResolvedValue({ data: { id: "email_1" }, error: null });
    const { sendResultsEmail } = await import("./send");

    const result = await sendResultsEmail(
      "student@example.com",
      report,
      "https://saati.app/r/1",
    );
    expect(result.success).toBe(true);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({ to: "student@example.com" }),
    );
  });

  it("returns failure when Resend returns an error", async () => {
    process.env.RESEND_API_KEY = "test-key";
    sendMock.mockResolvedValue({
      data: null,
      error: { message: "Invalid recipient" },
    });
    const { sendResultsEmail } = await import("./send");

    const result = await sendResultsEmail(
      "bad@example.com",
      report,
      "https://saati.app/r/1",
    );
    expect(result.success).toBe(false);
  });

  it("returns failure if the send call throws", async () => {
    process.env.RESEND_API_KEY = "test-key";
    sendMock.mockRejectedValue(new Error("network error"));
    const { sendResultsEmail } = await import("./send");

    const result = await sendResultsEmail(
      "student@example.com",
      report,
      "https://saati.app/r/1",
    );
    expect(result.success).toBe(false);
  });
});
