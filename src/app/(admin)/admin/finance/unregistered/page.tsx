import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireBoard } from "@/src/lib/auth/require-board";
import PortalPageHeader from "@/src/components/layout/PortalPageHeader";
import { PendingFinancialAccounts } from "@/src/components/admin/finance/PendingFinancialAccounts";
import { getUnregisteredFinanceAccounts } from "@/src/lib/finance/unregistered-queries";

export default async function UnregisteredFinancePage() {
  await requireBoard();
  const data = await getUnregisteredFinanceAccounts();
  return (
    <div className="space-y-6">
      <Link
        href="/admin/finance"
        className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft size={16} />
        Finance Management
      </Link>
      <PortalPageHeader
        eyebrow="Board Tools · Finance"
        title="Pending Financial Accounts"
        subtitle="Manage append-only history for people who are not yet CAFLA Portal members."
      />
      <PendingFinancialAccounts data={data} />
    </div>
  );
}
