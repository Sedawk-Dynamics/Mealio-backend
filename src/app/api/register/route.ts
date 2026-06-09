import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, REGISTRATIONS_TABLE } from "@/lib/supabase";
import {
  validateRegistration,
  normalizePhone,
  normalizeAadhaar,
} from "@/lib/validation";
import type { RegisterPayload } from "@/types/registration";

export const runtime = "nodejs";

/**
 * POST /api/register
 * Public endpoint that stores a registration after server-side validation.
 */
export async function POST(req: NextRequest) {
  let body: RegisterPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const errors = validateRegistration({
    name: body.name,
    email: body.email,
    phone: body.phone,
    address: body.address,
    aadhaarNumber: body.aadhaarNumber,
  });

  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Validation failed.", fields: errors },
      { status: 422 }
    );
  }

  if (!body.aadhaarDocumentUrl) {
    return NextResponse.json(
      { error: "Aadhaar document upload is required." },
      { status: 422 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from(REGISTRATIONS_TABLE)
      .insert({
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
        phone: normalizePhone(body.phone),
        address: body.address.trim(),
        aadhaar_number: normalizeAadhaar(body.aadhaarNumber),
        aadhaar_document_url: body.aadhaarDocumentUrl,
        aadhaar_public_id: body.aadhaarPublicId ?? null,
        aadhaar_resource_type: body.aadhaarResourceType ?? "image",
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Could not save registration." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Registration successful.", id: data.id },
      { status: 201 }
    );
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
