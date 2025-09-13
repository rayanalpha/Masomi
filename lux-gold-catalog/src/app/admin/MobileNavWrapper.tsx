import dynamic from "next/dynamic";

const AdminMobileNav = dynamic(() => import("./AdminMobileNav"), { ssr: false });

export default function MobileNavWrapper() {
  return (
    <div className="lg:hidden mb-4">
      <AdminMobileNav />
    </div>
  );
}