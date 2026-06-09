import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, REGISTRATIONS_TABLE } from "@/lib/supabase";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import type { Registration } from "@/types/registration";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * DELETE /api/admin/registrations/:id
 * Removes the registration row and best-effort deletes its Cloudinary asset.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAdmin(req);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdmin();

    // Fetch first so we know the Cloudinary asset to clean up.
    const { data: row, error: fetchError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .select("*")
      .eq("id", id)
      .single<Registration>();

    if (fetchError || !row) {
      return NextResponse.json(
        { error: "Registration not found." },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from(REGISTRATIONS_TABLE)
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Supabase delete error:", deleteError);
      return NextResponse.json(
        { error: "Could not delete registration." },
        { status: 500 }
      );
    }

    if (row.aadhaar_public_id) {
      await deleteFromCloudinary(
        row.aadhaar_public_id,
        row.aadhaar_resource_type || "image"
      );
    }

    return NextResponse.json({ message: "Registration deleted." });
  } catch (err) {
    console.error("Delete registration error:", err);
    return NextResponse.json(
      { error: "Something went wrong." },
      { status: 500 }
    );
  }
}
