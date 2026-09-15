"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/src/components/ui/button";
import { formatUsdFromCents } from "@/src/lib/finance/money";

type Row = Record<string, unknown>;
export function PendingFinancialAccounts({
  data,
}: {
  data: {
    identities: Row[];
    transactions: Row[];
    links: Row[];
    aliases: Row[];
    members: Row[];
  };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [memberSelections, setMemberSelections] = useState<
    Record<string, string>
  >({});
  const links = new Map(
    data.links.map((l) => [String(l.unregistered_referee_id), l]),
  );
  async function command(url: string, body: object) {
    if (pending) return;
    setPending(true);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error ?? "Finance command failed.");
      toast.success("Finance command completed.");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Finance command failed.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-4">
      {data.identities.map((identity) => {
        const id = String(identity.id);
        const rows = data.transactions.filter(
          (t) => t.unregistered_referee_id === id,
        );
        const balance = rows.reduce(
          (sum, t) => sum + BigInt(String(t.amount_cents)),
          BigInt(0),
        );
        const linked = links.get(id);
        return (
          <article
            key={id}
            className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold text-white">
                    {String(identity.display_name)}
                  </h2>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${linked ? "bg-blue-400/10 text-blue-300" : "bg-amber-400/10 text-amber-300"}`}
                  >
                    {linked ? "Linked" : "Pending"}
                  </span>
                </div>
                <p className="mt-1 text-xl font-semibold text-white">
                  {formatUsdFromCents(balance, { showPositiveSign: true })}
                </p>
                <p className="text-xs text-gray-500">
                  {data.aliases
                    .filter((a) => a.unregistered_referee_id === id)
                    .map((a) => String(a.arbiter_name))
                    .join(", ") || "No Arbiter alias"}
                </p>
              </div>
              {!linked && (
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-80">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      const amount = window.prompt(
                        "Signed amount in cents (negative means owes CAFLA):",
                      );
                      const description = window.prompt("Description:");
                      if (amount && description)
                        void command(
                          "/api/admin/finance/unregistered/transactions",
                          {
                            unregistered_referee_id: id,
                            transaction_date: new Date()
                              .toISOString()
                              .slice(0, 10),
                            transaction_type: "adjustment",
                            amount_cents: amount,
                            description,
                            idempotency_key: crypto.randomUUID(),
                          },
                        );
                    }}
                  >
                    Record Transaction
                  </Button>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      aria-label={`Destination member for ${String(identity.display_name)}`}
                      value={memberSelections[id] ?? ""}
                      onChange={(event) =>
                        setMemberSelections((current) => ({
                          ...current,
                          [id]: event.target.value,
                        }))
                      }
                      className="h-9 min-w-0 flex-1 rounded-md border border-white/10 bg-[#07100E] px-2.5 text-sm text-white outline-none focus:border-yellow-400/50 focus-visible:ring-2 focus-visible:ring-yellow-400/30"
                    >
                      <option value="">Choose destination member</option>
                      {data.members.map((member) => (
                        <option
                          key={String(member.id)}
                          value={String(member.id)}
                        >
                          {String(member.full_name)} — {String(member.email)} (
                          {String(member.status)})
                        </option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={pending || !memberSelections[id]}
                      onClick={() =>
                        void command(
                          `/api/admin/finance/unregistered/${id}/link`,
                          {
                            member_id: memberSelections[id],
                            idempotency_key: crypto.randomUUID(),
                          },
                        )
                      }
                    >
                      Link to Member
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              {rows.map((t) => (
                <div
                  key={String(t.id)}
                  className="flex flex-col gap-2 rounded-xl bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-white">
                      {String(t.description)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {String(t.transaction_date)} ·{" "}
                      {String(t.transaction_type)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-white">
                      {formatUsdFromCents(String(t.amount_cents), {
                        showPositiveSign: true,
                      })}
                    </span>
                    {!linked && t.transaction_type !== "reversal" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={pending}
                        onClick={() => {
                          const reason = window.prompt("Reversal reason:");
                          if (reason)
                            void command(
                              `/api/admin/finance/unregistered/transactions/${String(t.id)}/reverse`,
                              {
                                transaction_date: new Date()
                                  .toISOString()
                                  .slice(0, 10),
                                description: `Reversal: ${String(t.description)}`,
                                reversal_reason: reason,
                                idempotency_key: crypto.randomUUID(),
                              },
                            );
                        }}
                      >
                        Reverse
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {rows.length === 0 && (
                <p className="text-sm text-gray-500">
                  No financial activity. Empty identities should not be created
                  during cutover.
                </p>
              )}
            </div>
          </article>
        );
      })}
      {data.identities.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-gray-500">
          No pending financial accounts.
        </div>
      )}
    </div>
  );
}
