import { NextResponse } from "next/server";
import { getReportData } from "@/lib/report/getReportData";
import { renderReportPdf } from "@/lib/pdf/render";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;

  const report = await getReportData(id);
  if (!report) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "We couldn't find that assessment.",
        },
      },
      { status: 404 },
    );
  }

  // The PDF renders the whole report, including the breakdown the results
  // page keeps behind the email gate, so it has to respect the same gate —
  // otherwise the URL alone defeats it. Also worth noting: rendering is
  // expensive (headless chromium), and this is an unauthenticated route,
  // so refusing early matters for more than consistency.
  if (!report.hasEmail) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EMAIL_REQUIRED",
          message: "Enter your email on the results page to download the PDF.",
        },
      },
      { status: 403 },
    );
  }

  const resultsUrl = new URL(`/assessment/${id}`, request.url).toString();
  const pdfBuffer = await renderReportPdf(resultsUrl);

  return new NextResponse(new Blob([new Uint8Array(pdfBuffer)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="saati-results-${id}.pdf"`,
    },
  });
}
