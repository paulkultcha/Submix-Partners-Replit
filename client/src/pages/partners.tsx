import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PartnerTable } from "@/components/partners/partner-table";

export default function Partners() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Header title="Partner Management" subtitle="Manage your affiliate partners and their performance" />
        
        <div className="p-6">
          <PartnerTable />
        </div>
      </div>
    </div>
  );
}
