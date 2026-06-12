"use client";

import { useRef, useState } from "react";
import {
  validateRegistration,
  ValidationErrors,
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  formatFileSize,
} from "@/lib/validation";

interface UploadResult {
  url: string;
  publicId: string;
  resourceType: string;
  format: string;
  bytes: number;
}

type UploadStatus = "idle" | "uploading" | "done" | "error";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  aadhaarNumber: "",
};

export default function RegistrationForm() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);

  function updateField(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function resetUpload() {
    setFile(null);
    setPreview(null);
    setIsPdf(false);
    setProgress(0);
    setUploadStatus("idle");
    setUploadError(null);
    setUploaded(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    setUploadError(null);
    const ext = selected.name.split(".").pop()?.toLowerCase() || "";
    const typeOk =
      ALLOWED_MIME_TYPES.includes(selected.type) ||
      ALLOWED_EXTENSIONS.includes(ext);

    if (!typeOk) {
      setUploadError("Only JPG, JPEG, PNG and PDF files are allowed.");
      resetUpload();
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setUploadError(
        `File is too large (${formatFileSize(selected.size)}). Max 5 MB.`
      );
      resetUpload();
      return;
    }

    const pdf = ext === "pdf" || selected.type === "application/pdf";
    setFile(selected);
    setIsPdf(pdf);
    setPreview(pdf ? null : URL.createObjectURL(selected));
    uploadFile(selected);
  }

  function uploadFile(selected: File) {
    setUploadStatus("uploading");
    setProgress(0);
    setUploaded(null);

    const data = new FormData();
    data.append("file", selected);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const res = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploaded(res as UploadResult);
          setUploadStatus("done");
          setProgress(100);
        } else {
          setUploadStatus("error");
          setUploadError(res.error || "Upload failed.");
        }
      } catch {
        setUploadStatus("error");
        setUploadError("Upload failed. Please try again.");
      }
    };

    xhr.onerror = () => {
      setUploadStatus("error");
      setUploadError("Network error during upload.");
    };

    xhr.send(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);
    setSubmitMessage(null);

    const fieldErrors = validateRegistration(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    if (!uploaded) {
      setUploadError("Please upload your Aadhaar document.");
      return;
    }
    if (uploadStatus !== "done") {
      setUploadError("Please wait for the upload to finish.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          aadhaarDocumentUrl: uploaded.url,
          aadhaarPublicId: uploaded.publicId,
          aadhaarResourceType: uploaded.resourceType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        setSubmitError(data.error || "Registration failed.");
        return;
      }

      setSubmitMessage("Registration successful! Your details have been saved.");
      setForm(initialForm);
      resetUpload();
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
    >
      {submitMessage && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          {submitMessage}
        </div>
      )}
      {submitError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      <Field label="Full Name" error={errors.name}>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="John Doe"
          className={inputClass(errors.name)}
        />
      </Field>

      <Field label="Email" error={errors.email}>
        <input
          type="email"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="john@example.com"
          className={inputClass(errors.email)}
        />
      </Field>

      <Field label="Phone Number" error={errors.phone}>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => updateField("phone", e.target.value)}
          placeholder="9876543210"
          className={inputClass(errors.phone)}
        />
      </Field>

      <Field label="Address" error={errors.address}>
        <textarea
          value={form.address}
          onChange={(e) => updateField("address", e.target.value)}
          placeholder="House no, street, city, state, PIN"
          rows={3}
          className={inputClass(errors.address)}
        />
      </Field>

      <Field label="Aadhaar Number" error={errors.aadhaarNumber}>
        <input
          type="text"
          inputMode="numeric"
          maxLength={14}
          value={form.aadhaarNumber}
          onChange={(e) => updateField("aadhaarNumber", e.target.value)}
          placeholder="1234 5678 9012"
          className={inputClass(errors.aadhaarNumber)}
        />
      </Field>

      {/* Aadhaar upload */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          Aadhaar Document (JPG, PNG or PDF — max 5 MB)
        </label>

        {!file ? (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-white px-4 py-8 text-center transition hover:border-brand-purple hover:bg-brand-purple/5">
            <span className="text-sm font-semibold text-brand-purple">
              Click to choose a file
            </span>
            <span className="mt-1 text-xs text-slate-400">
              JPG, JPEG, PNG, PDF up to 5 MB
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-3">
              {isPdf ? (
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded bg-red-50 text-xs font-semibold text-red-600">
                  PDF
                </div>
              ) : preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Aadhaar preview"
                  className="h-14 w-14 flex-shrink-0 rounded object-cover"
                />
              ) : null}

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-700">
                  {file.name}
                </p>
                <p className="text-xs text-slate-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <button
                type="button"
                onClick={resetUpload}
                className="text-xs font-medium text-slate-500 hover:text-red-600"
              >
                Remove
              </button>
            </div>

            {/* Progress */}
            {uploadStatus === "uploading" && (
              <div className="mt-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-purple to-brand-orange transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Uploading… {progress}%
                </p>
              </div>
            )}
            {uploadStatus === "done" && (
              <p className="mt-2 text-xs font-medium text-green-600">
                ✓ Uploaded successfully
              </p>
            )}
            {uploadStatus === "error" && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {uploadError || "Upload failed."}
              </p>
            )}
          </div>
        )}

        {uploadError && !file && (
          <p className="mt-1.5 text-xs text-red-600">{uploadError}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting || uploadStatus === "uploading"}
        className="w-full rounded-lg bg-gradient-to-r from-brand-purple to-brand-purple-dark px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-purple/25 transition hover:shadow-brand-purple/40 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:brightness-100"
      >
        {submitting ? "Submitting…" : "Submit Registration"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function inputClass(error?: string) {
  return [
    "w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition",
    "placeholder:text-slate-400 focus:ring-2 focus:ring-brand-purple/25",
    error
      ? "border-red-400 focus:border-red-400 focus:ring-red-200"
      : "border-slate-300 focus:border-brand-purple",
  ].join(" ");
}
