import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, REGISTRATIONS_TABLE } from "@/lib/supabase";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * GET /api/admin/registrations?search=<q>
 * Returns all registrations (newest first), optionally filtered by a search
 * term that matches name / email / phone / aadhaar number.
 */
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const search = req.nextUrl.searchParams.get("search")?.trim();

  try {
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from(REGISTRATIONS_TABLE)
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      // ilike across the searchable text columns.
      const term = `%${search}%`;
      query = query.or(
        `name.ilike.${term},email.ilike.${term},phone.ilike.${term},aadhaar_number.ilike.${term}`
      );
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase select error:", error);
      return NextResponse.json(
        { error: "Could not load registrations." },
        { status: 500 }
      );
    }

    return NextResponse.json({ registrations: data ?? [] });
  } catch (err) {
    console.error("List registrations error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
