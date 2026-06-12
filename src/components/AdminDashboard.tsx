"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Registration } from "@/types/registration";
import { EatisoLogo } from "@/components/EatisoLogo";

/** Force a Cloudinary URL to download instead of opening inline. */
function toDownloadUrl(url: string): string {
  return url.includes("/upload/")
    ? url.replace("/upload/", "/upload/fl_attachment/")
    : url;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminDashboard() {
  const router = useRouter();
  const [rows, setRows] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      const url = term
        ? `/api/admin/registrations?search=${encodeURIComponent(term)}`
        : "/api/admin/registrations";
      const res = await fetch(url);
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load registrations.");
        return;
      }
      setRows(data.registrations);
    } catch {
      setError("Network error while loading registrations.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load("");
  }, [load]);

  // Debounced search.
  useEffect(() => {
    const t = setTimeout(() => load(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this registration? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/registrations/${id}`, {
        method: "DELETE",
      });
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Delete failed.");
        return;
      }
      setRows((r) => r.filter((row) => row.id !== id));
    } catch {
      alert("Network error during delete.");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <EatisoLogo size={40} />
        <button
          onClick={handleLogout}
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Registrations</h1>
        <p className="text-sm text-slate-500">
          {rows.length} record{rows.length === 1 ? "" : "s"}
        </p>
      </div>

      <div className="mb-4">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or Aadhaar…"
          className="w-full max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-purple focus:ring-2 focus:ring-brand-purple/25"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Address</th>
              <th className="px-4 py-3">Aadhaar</th>
              <th className="px-4 py-3">Document</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  No registrations found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-slate-50/60">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {row.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{row.email}</div>
                    <div className="text-slate-400">{row.phone}</div>
                  </td>
                  <td className="max-w-xs px-4 py-3 text-slate-600">
                    {row.address}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-700">
                    {row.aadhaar_number}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <a
                        href={row.aadhaar_document_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-brand-purple hover:underline"
                      >
                        View
                      </a>
                      <a
                        href={toDownloadUrl(row.aadhaar_document_url)}
                        className="text-slate-500 hover:underline"
                      >
                        Download
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                    {formatDate(row.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(row.id)}
                      disabled={deletingId === row.id}
                      className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === row.id ? "Deleting…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
