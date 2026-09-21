"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/src/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { formatFinanceDateRange } from "@/src/lib/finance/dates";
import { formatUsdFromCents } from "@/src/lib/finance/money";

export function CreatePendingFinancialAccountDialog({
  open,
  defaultName,
  busy,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  defaultName: string;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string) => Promise<void>;
}) {
  const [name, setName] = useState(defaultName);
  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Track as New Unregistered</DialogTitle>
          <DialogDescription>
            Create a Board-only pending financial account and use it for this
            referee&apos;s assignments.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="pending-display-name">Display name</Label>
          <Input
            id="pending-display-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
            autoFocus
          />
        </div>
        <p className="rounded-xl border border-yellow-400/15 bg-yellow-400/[0.05] p-4 text-sm text-gray-300">
          This does not create a Portal member. The account can be linked
          permanently when the person later exists in CAFLA Portal.
        </p>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className={primaryButton}
            disabled={busy || !name.trim()}
            onClick={() => void onCreate(name.trim())}
          >
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Creating..." : "Create Pending Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmArbiterFeePostingDialog({
  open,
  busy,
  onOpenChange,
  onConfirm,
  periodStart,
  periodEnd,
  assignmentCount,
  refereeCount,
  grossCents,
  feeCents,
}: {
  open: boolean;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  periodStart: string | null;
  periodEnd: string | null;
  assignmentCount: number;
  refereeCount: number;
  grossCents: number;
  feeCents: number;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !busy && onOpenChange(next)}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>Post Arbiter Fees</DialogTitle>
          <DialogDescription>
            Review the final totals before creating immutable Finance ledger
            entries.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Summary
            label="Assignment period"
            value={formatFinanceDateRange(periodStart, periodEnd)}
          />
          <Summary label="Financial accounts" value={String(refereeCount)} />
          <Summary label="New assignments" value={String(assignmentCount)} />
          <Summary
            label="Gross earnings"
            value={formatUsdFromCents(grossCents)}
          />
        </div>
        <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/[0.07] p-4">
          <p className="text-sm text-gray-300">Total CAFLA fee</p>
          <p className="mt-1 text-2xl font-semibold text-yellow-200">
            {formatUsdFromCents(feeCents)}
          </p>
        </div>
        <p className="text-sm leading-6 text-gray-400">
          Posting is atomic and cannot be edited afterward. Any correction must
          use the approved reversal procedure.
        </p>
        <DialogFooter>
          <Button
            variant="ghost"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            className={primaryButton}
            disabled={busy}
            onClick={() => void onConfirm()}
          >
            {busy && <Loader2 className="animate-spin" />}
            {busy ? "Posting..." : `Post ${formatUsdFromCents(feeCents)}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-white">{value}</p>
    </div>
  );
}
const dialogClass = "border-white/10 bg-[#07100E] text-white sm:max-w-lg";
const primaryButton =
  "bg-yellow-400 text-black hover:bg-yellow-300 focus-visible:ring-yellow-400/60 disabled:bg-yellow-400/30";
