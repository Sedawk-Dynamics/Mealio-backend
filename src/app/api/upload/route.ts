import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE,
} from "@/lib/validation";

export const runtime = "nodejs";

/**
 * POST /api/upload
 * multipart/form-data with a single `file` field.
 * Uploads the Aadhaar document to Cloudinary and returns its URL.
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "No file provided." },
        { status: 400 }
      );
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const mimeOk = ALLOWED_MIME_TYPES.includes(file.type);
    const extOk = ALLOWED_EXTENSIONS.includes(ext);

    if (!mimeOk && !extOk) {
      return NextResponse.json(
        { error: "Only JPG, JPEG, PNG and PDF files are allowed." },
        { status: 415 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File is too large. Maximum size is 5 MB." },
        { status: 413 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadToCloudinary(buffer, file.name);

    return NextResponse.json({
      url: uploaded.url,
      publicId: uploaded.publicId,
      resourceType: uploaded.resourceType,
      format: uploaded.format,
      bytes: uploaded.bytes,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
