import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import AdminMobileNav from "./AdminMobileNav";
import AdminSidebar from "./AdminSidebar";

export const dynamic = "force-dynamic";

function MobileAdminNavMount() {
  return (
    <div className="lg:hidden mb-4">
      <AdminMobileNav />
    </div>
  );
}

export default async function AdminLayout({ children }: { children: ReactNode }) {
  let session;
  let role;
  try {
    session = await getServerSession(authOptions);
    role = (session?.user as any)?.role as string | undefined;
    
    console.log("ADMIN_LAYOUT_DEBUG", {
      hasSession: !!session,
      userEmail: session?.user?.email,
      role: role,
      shouldAllow: !!(session && role && (role === "ADMIN" || role === "MANAGER"))
    });
    
  } catch (e) {
    console.error("ADMIN_LAYOUT_SESSION_ERROR", e);
    redirect("/login");
  }
  
  if (!session || !role || (role !== "ADMIN" && role !== "MANAGER")) {
    console.log("ADMIN_LAYOUT_REDIRECT", { hasSession: !!session, role });
    redirect("/login");
  }

  return (
    <div className="admin-layout min-h-dvh grid lg:grid-cols-[280px_1fr] gap-0 lg:gap-6 p-2 sm:p-4">
      {/* Desktop Sidebar */}
      <AdminSidebar />
      
      {/* Main Content */}
      <main className="admin-main p-4 sm:p-6 lg:p-8">
        <MobileAdminNavMount />
        {children}
      </main>
    </div>
  );
}

