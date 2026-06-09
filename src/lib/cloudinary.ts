import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const UPLOAD_FOLDER =
  process.env.CLOUDINARY_UPLOAD_FOLDER || "mealio/aadhaar";

export interface UploadedFile {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}

/**
 * Upload a file buffer to Cloudinary.
 *
 * `resource_type: "auto"` lets Cloudinary accept both images (jpg/png) and
 * raw files (pdf) with one call — the easiest possible implementation.
 */
export function uploadToCloudinary(
  buffer: Buffer,
  filename: string
): Promise<UploadedFile> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: UPLOAD_FOLDER,
        resource_type: "auto",
        public_id: `${Date.now()}-${filename.replace(/\.[^.]+$/, "")}`,
        use_filename: true,
        unique_filename: true,
      },
      (error, result) => {
        if (error || !result) {
          return reject(error || new Error("Cloudinary upload failed"));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );
    stream.end(buffer);
  });
}

/** Remove a file from Cloudinary (used when a registration is deleted). */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: string = "image"
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      invalidate: true,
    });
  } catch {
    // Non-fatal: the DB record is still removed even if asset cleanup fails.
  }
}

export { cloudinary };
