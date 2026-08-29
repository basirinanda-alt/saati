import { NextResponse } from "next/server";
import { z } from "zod";
import { getReportData } from "@/lib/report/getReportData";
import { prisma } from "@/lib/db/client";
import { sendResultsEmail } from "@/lib/email/send";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = {
  success: false;
  error: { code: string; message: string; details?: unknown };
};

function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: { code, message, details } },
    { status },
  );
}

const requestSchema = z.object({
  email: z.string().email(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail(400, "VALIDATION_ERROR", "Please enter a valid email address.");
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Please enter a valid email address.",
      parsed.error.flatten(),
    );
  }

  // Attach the address to the session BEFORE building the report. This is
  // the request that unlocks the full breakdown (see the results page), so
  // the write has to land even if the send later fails — a student who
  // gave us their email must not be sent back to a locked page because
  // Resend had a bad minute.
  //
  // An address is only ever written to an unclaimed session. Once a
  // session has an email, this endpoint reverts to its original job of
  // sending an extra copy elsewhere, and will not overwrite the original —
  // otherwise anyone holding the results URL could repoint someone else's
  // session at their own address.
  const existing = await prisma.assessmentSession.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!existing) {
    return fail(404, "NOT_FOUND", "We couldn't find that assessment.");
  }
  if (!existing.email) {
    await prisma.assessmentSession.update({
      where: { id },
      data: { email: parsed.data.email },
    });
  }

  const report = await getReportData(id);
  if (!report) {
    return fail(404, "NOT_FOUND", "We couldn't find that assessment.");
  }

  const resultsUrl = new URL(`/assessment/${id}`, request.url).toString();
  const result = await sendResultsEmail(parsed.data.email, report, resultsUrl);

  if (!result.success) {
    return fail(
      502,
      "EMAIL_UNAVAILABLE",
      result.error ?? "Something went wrong sending your email.",
    );
  }

  return NextResponse.json<ApiSuccess<{ sent: true }>>({
    success: true,
    data: { sent: true },
  });
}
