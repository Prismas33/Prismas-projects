import { AdminAuthProvider } from "@/lib/context/AdminAuthContext";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <div className="admin-container">
        {children}
      </div>
    </AdminAuthProvider>
  );
}
