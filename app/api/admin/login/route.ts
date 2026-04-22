import { NextResponse } from "next/server";
import { setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const hasAdminPassword = Boolean(process.env.ADMIN_PASSWORD);

  if (!hasAdminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD env var is missing." },
      { status: 500 }
    );
  }

  const body = (await request.json()) as { password?: string };
  const password = body.password?.trim();

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  setAdminSessionCookie(response);
  return response;
}
