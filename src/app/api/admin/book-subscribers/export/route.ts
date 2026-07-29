import { NextRequest, NextResponse } from "next/server";
import { isAdminAccessGranted } from "@/lib/admin-auth";
import { readBookSubscribers } from "@/lib/book-subscribers";

export const runtime = "nodejs";

function escapeCsv(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get("key")?.trim();
  if (!(await isAdminAccessGranted(key))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const subscribers = (await readBookSubscribers()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const rows = [
    ["Nom", "Ville et pays", "Courriel", "Consentement", "Date d’inscription"],
    ...subscribers.map((subscriber) => [
      subscriber.name,
      subscriber.location,
      subscriber.email,
      subscriber.consent ? "Oui" : "Non",
      subscriber.createdAt,
    ]),
  ];
  const body = `\uFEFF${rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n")}\r\n`;
  const date = new Date().toISOString().slice(0, 10);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="abonnees-une-langue-une-vision-du-monde-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
