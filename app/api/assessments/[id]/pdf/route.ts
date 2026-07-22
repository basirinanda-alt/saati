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

  const resultsUrl = new URL(`/assessment/${id}`, request.url).toString();
  const pdfBuffer = await renderReportPdf(resultsUrl);

  return new NextResponse(new Blob([new Uint8Array(pdfBuffer)]), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="saati-results-${id}.pdf"`,
    },
  });
}
