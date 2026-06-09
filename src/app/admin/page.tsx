import AdminDashboard from "@/components/AdminDashboard";

export default function AdminPage() {
  // Access control is enforced by middleware.ts — only authenticated admins
  // reach this page.
  return <AdminDashboard />;
}
