"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Search,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import PortalPageHeader from "@/src/components/layout/PortalPageHeader";
import {
  ConfirmArbiterFeePostingDialog,
  CreatePendingFinancialAccountDialog,
} from "@/src/components/admin/finance/ArbiterFeeImportDialogs";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { formatUsdFromCents } from "@/src/lib/finance/money";
import {
  formatFinanceDate,
  formatFinanceDateRange,
} from "@/src/lib/finance/dates";

type Member = { id: string; full_name: string; email: string; status: string };
type Unregistered = {
  id: string;
  display_name: string;
  normalized_name: string;
};
type Batch = {
  id: string;
  original_filename: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  summary_metadata: Record<string, number>;
  posted_at: string | null;
};
type Item = {
  id: string;
  source_row_number: number;
  arbiter_game_id: string;
  role: "center" | "ar1" | "ar2";
  canonical_assignment_key: string;
  arbiter_referee_name: string;
  normalized_referee_name: string;
  member_id: string | null;
  unregistered_referee_id: string | null;
  match_date: string | null;
  kickoff_time: string | null;
  division: string | null;
  bill_to: string | null;
  home_team: string | null;
  away_team: string | null;
  gross_earnings_cents: number | string;
  fee_cents: number | string;
  initial_match_state: string;
  match_reason: string;
  resolution_confirmed: boolean;
  resolution_method: string;
  item_status: string;
};
type ImportPayload = {
  batch: Batch;
  items: Item[];
  members: Member[];
  unregistered: Unregistered[];
};

const warning =
  "Only upload fee-eligible Arbiter matches. Match status is not included in this export.";

export function ArbiterFeeImportWorkflow() {
  const [data, setData] = useState<ImportPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [success, setSuccess] = useState<Record<string, unknown> | null>(null);
  const [selectedFilename, setSelectedFilename] = useState("");
  const [pendingAccountItem, setPendingAccountItem] = useState<Item | null>(
    null,
  );
  const [postingConfirmationOpen, setPostingConfirmationOpen] = useState(false);
  const newItems =
    data?.items.filter((item) => item.item_status === "new") ?? [];
  const unresolved = newItems.filter(
    (item) =>
      !item.resolution_confirmed ||
      (!item.member_id && !item.unregistered_referee_id),
  );
  const memberMap = useMemo(
    () => new Map(data?.members.map((member) => [member.id, member]) ?? []),
    [data],
  );
  const refereeGroups = useMemo(() => {
    const groups = new Map<string, Item[]>();
    for (const item of data?.items ?? [])
      groups.set(item.normalized_referee_name, [
        ...(groups.get(item.normalized_referee_name) ?? []),
        item,
      ]);
    return [...groups.values()].filter(
      (items) =>
        !query ||
        items[0].arbiter_referee_name
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        (items[0].member_id &&
          memberMap
            .get(items[0].member_id)
            ?.full_name.toLowerCase()
            .includes(query.toLowerCase())),
    );
  }, [data, query, memberMap]);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = new FormData(event.currentTarget);
    setBusy(true);
    try {
      const response = await fetch("/api/admin/finance/arbiter-fees/imports", {
        method: "POST",
        body: form,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          payload?.error ?? "Unable to preview the Arbiter file.",
        );
      setData(payload);
      setSuccess(null);
      toast.success("Arbiter file parsed. Review the import before posting.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to preview the Arbiter file.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function resolve(item: Item, target: string, saveAlias: boolean) {
    if (busy) return;
    setBusy(true);
    try {
      const [targetType, targetId] = target.split(":", 2) as [
        "member" | "unregistered",
        string,
      ];
      if (saveAlias) {
        const aliasResponse = await fetch(
          "/api/admin/finance/arbiter-fees/mappings",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              arbiter_name: item.arbiter_referee_name,
              member_id: targetId,
            }),
          },
        );
        const aliasPayload = await aliasResponse.json().catch(() => null);
        if (!aliasResponse.ok)
          throw new Error(aliasPayload?.error ?? "Unable to save the mapping.");
      }
      const body =
        targetType === "member"
          ? { target_type: "member", member_id: targetId }
          : { target_type: "unregistered", unregistered_referee_id: targetId };
      const response = await fetch(
        `/api/admin/finance/arbiter-fees/imports/${data?.batch.id}/items/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error ?? "Unable to resolve the referee.");
      setData(payload);
      toast.success(
        saveAlias
          ? "Referee resolved and trusted mapping saved."
          : "Referee resolved for this import.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to resolve the referee.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function createUnregistered(displayName: string) {
    const item = pendingAccountItem;
    if (busy || !data || !item) return;
    setBusy(true);
    try {
      const response = await fetch("/api/admin/finance/unregistered", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: displayName,
          arbiter_name: item.arbiter_referee_name,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(
          payload?.error ?? "Unable to create the pending financial account.",
        );
      const target = payload.unregistered as Unregistered;
      const resolution = await fetch(
        `/api/admin/finance/arbiter-fees/imports/${data.batch.id}/items/${item.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_type: "unregistered",
            unregistered_referee_id: target.id,
          }),
        },
      );
      const resolved = await resolution.json().catch(() => null);
      if (!resolution.ok)
        throw new Error(resolved?.error ?? "Unable to resolve the referee.");
      setData(resolved);
      setPendingAccountItem(null);
      toast.success("Pending financial account created and selected.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create the pending financial account.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function post() {
    if (!data || busy || unresolved.length) return;
    setBusy(true);
    try {
      const response = await fetch(
        `/api/admin/finance/arbiter-fees/imports/${data.batch.id}/post`,
        { method: "POST" },
      );
      const payload = await response.json().catch(() => null);
      if (!response.ok)
        throw new Error(payload?.error ?? "Unable to post Arbiter fees.");
      setSuccess(payload.result);
      setData({ ...data, batch: { ...data.batch, status: "posted" } });
      setPostingConfirmationOpen(false);
      toast.success("Arbiter fees posted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to post Arbiter fees.",
      );
    } finally {
      setBusy(false);
    }
  }

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
        title="Import Arbiter Fees"
        subtitle="Parse, resolve and post the weekly Arbiter assignment fees."
      />
      <WorkflowProgress step={success ? 3 : data ? 2 : 1} />
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-amber-100">
        {warning}
      </div>
      {!data && (
        <form
          onSubmit={upload}
          className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0B1513] to-[#070B0A]"
        >
          <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.75fr)] lg:items-center">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-yellow-400/20 bg-yellow-400/10">
                <FileSpreadsheet className="h-5 w-5 text-yellow-300" />
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">
                Upload Arbiter schedule
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400">
                Select the weekly fee-eligible export. We parse the first
                worksheet and build a server-authoritative preview before
                anything can be posted.
              </p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-400">
                <span className="rounded-full border border-white/10 px-3 py-1">
                  .xls / .xlsx
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  10 MB max
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1">
                  10,000 rows max
                </span>
              </div>
            </div>
            <div className="rounded-xl border border-dashed border-white/15 bg-black/20 p-4">
              <label className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Arbiter export
              </label>
              <Input
                className="mt-3"
                name="file"
                type="file"
                accept=".xls,.xlsx"
                required
                disabled={busy}
                onChange={(event) =>
                  setSelectedFilename(event.target.files?.[0]?.name ?? "")
                }
              />
              <p className="mt-2 min-h-5 truncate text-xs text-gray-500">
                {selectedFilename || "No file selected"}
              </p>
              <Button
                className="mt-4 w-full bg-yellow-400 text-black hover:bg-yellow-300"
                disabled={busy}
              >
                {busy ? <Loader2 className="animate-spin" /> : <Upload />}
                {busy ? "Parsing..." : "Parse and Preview"}
              </Button>
            </div>
          </div>
        </form>
      )}
      {data && (
        <>
          <Summary data={data} />
          {success ? (
            <Success result={success} batch={data.batch} />
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Referee review
                  </h2>
                  <p className="text-sm text-gray-400">
                    Resolve every new assignment before posting.
                  </p>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-9"
                    placeholder="Search referee or member"
                  />
                </div>
              </div>
              <div className="space-y-3">
                {refereeGroups.map((items) => (
                  <RefereeCard
                    key={items[0].normalized_referee_name}
                    items={items}
                    members={data.members}
                    unregistered={data.unregistered}
                    memberMap={memberMap}
                    busy={busy}
                    onResolve={resolve}
                    onCreateUnregistered={setPendingAccountItem}
                  />
                ))}
              </div>
              <AssignmentDetails
                items={data.items}
                memberMap={memberMap}
                unregistered={data.unregistered}
              />
              <div className="sticky bottom-3 rounded-2xl border border-white/10 bg-[#07100E]/95 p-4 shadow-2xl backdrop-blur">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-semibold text-white">Final review</p>
                    <p className="text-sm text-gray-300">
                      {
                        new Set(newItems.map((i) => i.normalized_referee_name))
                          .size
                      }{" "}
                      financial accounts ·{" "}
                      {newItems.filter((i) => i.role === "center").length}{" "}
                      Center ·{" "}
                      {newItems.filter((i) => i.role !== "center").length} AR ·
                      Gross{" "}
                      {formatUsdFromCents(
                        newItems.reduce(
                          (n, i) => n + Number(i.gross_earnings_cents),
                          0,
                        ),
                      )}{" "}
                      · Fees{" "}
                      {formatUsdFromCents(
                        newItems.reduce((n, i) => n + Number(i.fee_cents), 0),
                      )}
                    </p>
                    <p
                      className={`text-sm ${unresolved.length ? "text-amber-300" : "text-emerald-300"}`}
                    >
                      {unresolved.length
                        ? `${unresolved.length} referee assignment${unresolved.length === 1 ? "" : "s"} still need to be resolved before this import can be posted.`
                        : `${newItems.length} new assignments are ready to post; already imported assignments are excluded.`}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{warning}</p>
                  </div>
                  <Button
                    onClick={() => setPostingConfirmationOpen(true)}
                    disabled={
                      busy || unresolved.length > 0 || newItems.length === 0
                    }
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    Review and Post Fees
                  </Button>
                </div>
              </div>
              <CreatePendingFinancialAccountDialog
                key={pendingAccountItem?.id ?? "closed"}
                open={pendingAccountItem !== null}
                defaultName={pendingAccountItem?.arbiter_referee_name ?? ""}
                busy={busy}
                onOpenChange={(open) => !open && setPendingAccountItem(null)}
                onCreate={createUnregistered}
              />
              <ConfirmArbiterFeePostingDialog
                open={postingConfirmationOpen}
                busy={busy}
                onOpenChange={setPostingConfirmationOpen}
                onConfirm={post}
                periodStart={data.batch.period_start}
                periodEnd={data.batch.period_end}
                assignmentCount={newItems.length}
                refereeCount={
                  new Set(newItems.map((i) => i.normalized_referee_name)).size
                }
                grossCents={newItems.reduce(
                  (n, i) => n + Number(i.gross_earnings_cents),
                  0,
                )}
                feeCents={newItems.reduce((n, i) => n + Number(i.fee_cents), 0)}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function Summary({ data }: { data: ImportPayload }) {
  const s = data.batch.summary_metadata;
  const cells = [
    ["Matches", s.matches],
    ["Assignments", s.assignments],
    ["Malformed", s.malformed],
    ["Center", s.center],
    ["AR", s.ar],
    ["Gross", formatUsdFromCents(s.gross_cents ?? 0)],
    ["CAFLA fees", formatUsdFromCents(s.fee_cents ?? 0)],
    ["New", s.new],
    ["Already imported", s.already_imported],
    ["Duplicate in file", s.duplicate_in_file],
    ["Exact", s.exact],
    ["Suggested", s.suggested],
    ["Ambiguous", s.ambiguous],
    ["Unmatched", s.unmatched],
  ];
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-5">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <h2 className="font-semibold text-white">Import Summary</h2>
          <p className="text-sm text-gray-400">
            {data.batch.original_filename} ·{" "}
            {formatFinanceDateRange(
              data.batch.period_start,
              data.batch.period_end,
            )}
          </p>
        </div>
        <span className="rounded-full bg-white/[0.06] px-3 py-1 text-xs uppercase text-gray-300">
          {data.batch.status}
        </span>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        {cells.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/5 bg-white/[0.025] p-3"
          >
            <p className="text-xs text-gray-500">{label}</p>
            <p className="mt-1 font-semibold text-white">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RefereeCard({
  items,
  members,
  unregistered,
  memberMap,
  busy,
  onResolve,
  onCreateUnregistered,
}: {
  items: Item[];
  members: Member[];
  unregistered: Unregistered[];
  memberMap: Map<string, Member>;
  busy: boolean;
  onResolve: (item: Item, target: string, save: boolean) => void;
  onCreateUnregistered: (item: Item) => void;
}) {
  const item = items[0];
  const [choice, setChoice] = useState(
    item.member_id
      ? `member:${item.member_id}`
      : item.unregistered_referee_id
        ? `unregistered:${item.unregistered_referee_id}`
        : "",
  );
  const [save, setSave] = useState(false);
  const fresh = items.filter((i) => i.item_status === "new");
  const center = fresh.filter((i) => i.role === "center").length;
  const ar = fresh.length - center;
  const imported = items.filter(
    (i) => i.item_status === "already_imported",
  ).length;
  const centerFee = fresh
    .filter((i) => i.role === "center")
    .reduce((n, i) => n + Number(i.fee_cents), 0);
  const arFee = fresh
    .filter((i) => i.role !== "center")
    .reduce((n, i) => n + Number(i.fee_cents), 0);
  const member = item.member_id ? memberMap.get(item.member_id) : null;
  const provisional = item.unregistered_referee_id
    ? unregistered.find((u) => u.id === item.unregistered_referee_id)
    : null;
  const resolved =
    fresh.length === 0 ||
    fresh.every(
      (i) =>
        i.resolution_confirmed && (i.member_id || i.unregistered_referee_id),
    );
  return (
    <article className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-white">
              {item.arbiter_referee_name}
            </h3>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${resolved ? "bg-emerald-400/10 text-emerald-300" : "bg-amber-400/10 text-amber-300"}`}
            >
              {resolved ? "resolved" : item.initial_match_state}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-400">
            {member
              ? `${member.full_name} · ${member.status}`
              : provisional
                ? `${provisional.display_name} · Pending financial account`
                : "No confirmed financial identity"}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            {center} Center · {ar} AR · {fresh.length} new · {imported} already
            imported
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Gross{" "}
            {formatUsdFromCents(
              fresh.reduce((n, i) => n + Number(i.gross_earnings_cents), 0),
            )}{" "}
            · Center fee {formatUsdFromCents(centerFee)} · AR fee{" "}
            {formatUsdFromCents(arFee)} · Total fee{" "}
            {formatUsdFromCents(centerFee + arFee)}
          </p>
        </div>
        {!resolved && (
          <div className="w-full space-y-3 lg:max-w-md">
            <select
              value={choice}
              onChange={(e) => {
                setChoice(e.target.value);
                if (!e.target.value.startsWith("member:")) setSave(false);
              }}
              className="h-10 w-full rounded-md border border-white/10 bg-[#07100E] px-3 text-sm text-white"
            >
              <option value="">Leave unresolved</option>
              <optgroup label="CAFLA members">
                {members.map((m) => (
                  <option key={m.id} value={`member:${m.id}`}>
                    {m.full_name} — {m.email} ({m.status})
                  </option>
                ))}
              </optgroup>
              <optgroup label="Pending financial accounts">
                {unregistered.map((u) => (
                  <option key={u.id} value={`unregistered:${u.id}`}>
                    {u.display_name}
                  </option>
                ))}
              </optgroup>
            </select>
            {choice.startsWith("member:") && (
              <label className="group flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-xs leading-5 text-gray-400 transition-colors hover:text-gray-300">
                <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                  <input
                    type="checkbox"
                    checked={save}
                    onChange={(e) => setSave(e.target.checked)}
                    className="peer h-[18px] w-[18px] cursor-pointer appearance-none rounded-[5px] border border-emerald-900/70 bg-[#07100E] transition-colors hover:border-yellow-400/60 checked:border-yellow-400 checked:bg-yellow-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B0F0F]"
                  />
                  <Check
                    aria-hidden="true"
                    className="pointer-events-none absolute h-3.5 w-3.5 stroke-[3] text-[#07100E] opacity-0 transition-opacity peer-checked:opacity-100"
                  />
                </span>
                <span>Save this Arbiter name mapping for future imports</span>
              </label>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={busy || !choice}
                onClick={() => onResolve(item, choice, save)}
                className="bg-yellow-400 text-black hover:bg-yellow-300"
              >
                Confirm Selection
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={busy}
                onClick={() => onCreateUnregistered(item)}
                className="border-emerald-900/60 bg-[#07100E] text-white hover:border-yellow-400/50 hover:text-yellow-300"
              >
                Track as New Unregistered
              </Button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

function AssignmentDetails({
  items,
  memberMap,
  unregistered,
}: {
  items: Item[];
  memberMap: Map<string, Member>;
  unregistered: Unregistered[];
}) {
  return (
    <details className="rounded-2xl border border-white/10 bg-[#0B0F0F]/70">
      <summary className="cursor-pointer p-5 font-semibold text-white">
        Assignment-level details ({items.length})
      </summary>
      <div className="space-y-3 border-t border-white/10 p-4">
        {items.map((item) => {
          const identity = item.member_id
            ? memberMap.get(item.member_id)?.full_name
            : item.unregistered_referee_id
              ? unregistered.find(
                  (row) => row.id === item.unregistered_referee_id,
                )?.display_name
              : null;
          return (
            <div
              key={item.id}
              className="rounded-xl bg-white/[0.025] p-3 text-sm"
            >
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-medium text-white">
                  Game {item.arbiter_game_id} ·{" "}
                  {item.role === "center" ? "Center" : item.role.toUpperCase()}
                </p>
                <span className="text-xs uppercase text-gray-400">
                  {item.item_status.replaceAll("_", " ")}
                </span>
              </div>
              <p className="mt-1 text-gray-400">
                {item.match_date
                  ? formatFinanceDate(item.match_date)
                  : "Invalid date"}{" "}
                {item.kickoff_time ?? ""} · {item.home_team || "Home"} vs{" "}
                {item.away_team || "Away"}{" "}
                {item.division ? `· ${item.division}` : ""}
              </p>
              <p className="mt-1 text-gray-500">
                Bill-To: {item.bill_to || "Not provided"}
              </p>
              <p className="mt-1 text-gray-400">
                {item.arbiter_referee_name} → {identity ?? "Unresolved"} · Gross{" "}
                {formatUsdFromCents(item.gross_earnings_cents)} · Fee{" "}
                {formatUsdFromCents(item.fee_cents)}
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-300">
                  Technical details
                </summary>
                <dl className="mt-2 grid gap-1 break-all text-xs text-gray-500">
                  <div>
                    <dt className="inline">Canonical assignment key: </dt>
                    <dd className="inline font-mono">
                      {item.canonical_assignment_key}
                    </dd>
                  </div>
                  <div>
                    <dt className="inline">Import item ID: </dt>
                    <dd className="inline font-mono">{item.id}</dd>
                  </div>
                </dl>
              </details>
            </div>
          );
        })}
      </div>
    </details>
  );
}

function Success({
  result,
  batch,
}: {
  result: Record<string, unknown>;
  batch: Batch;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-6">
      <CheckCircle2 className="h-10 w-10 text-emerald-300" />
      <h2 className="mt-3 text-xl font-semibold text-white">
        Import posted successfully
      </h2>
      <p className="mt-1 text-sm text-gray-300">
        Period {formatFinanceDateRange(batch.period_start, batch.period_end)}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        <Metric
          label="Financial accounts charged"
          value={result.transaction_count}
        />
        <Metric label="Assignments posted" value={result.assignment_count} />
        <Metric
          label="Total CAFLA fees"
          value={formatUsdFromCents(String(result.total_fee_cents ?? 0))}
        />
        <Metric
          label="Posting date"
          value={
            result.transaction_date
              ? formatFinanceDate(String(result.transaction_date))
              : "Unavailable"
          }
        />
      </div>
      <Link
        href="/admin/finance"
        className="mt-5 inline-flex rounded-md bg-yellow-400 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-300"
      >
        Return to Finance Management
      </Link>
    </div>
  );
}
function Metric({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl bg-black/20 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-semibold text-white">{String(value ?? 0)}</p>
    </div>
  );
}

function WorkflowProgress({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/10 bg-black/20">
      {["Upload", "Review & Resolve", "Confirm"].map((label, index) => {
        const number = index + 1;
        const active = number === step;
        const complete = number < step;
        return (
          <li
            key={label}
            className={`flex min-w-0 items-center gap-2 border-r border-white/10 px-3 py-3 last:border-r-0 sm:px-5 ${active ? "bg-yellow-400/[0.08]" : ""}`}
          >
            <span
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${complete ? "bg-emerald-400 text-black" : active ? "bg-yellow-400 text-black" : "bg-white/10 text-gray-400"}`}
            >
              {complete ? "✓" : number}
            </span>
            <span
              className={`truncate text-xs font-medium sm:text-sm ${active ? "text-yellow-200" : complete ? "text-emerald-300" : "text-gray-500"}`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
