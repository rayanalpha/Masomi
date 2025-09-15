'use client';

import dynamic from "next/dynamic";

const AdminMobileNav = dynamic(() => import("./AdminMobileNav"), { ssr: false });

export default function MobileAdminNavMount() {
  return (
    <div className="lg:hidden mb-4">
      <AdminMobileNav />
    </div>
  );
}