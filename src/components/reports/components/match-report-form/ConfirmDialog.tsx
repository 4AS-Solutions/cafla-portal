import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"

type ConfirmationType = "no-goals" | "no-cards" | null

type MatchReportConfirmationDialogProps = {
  open: boolean
  type: ConfirmationType
  onCancel: () => void
  onConfirm: () => void
}

export function MatchReportConfirmationDialog({
  open,
  type,
  onCancel,
  onConfirm,
}: MatchReportConfirmationDialogProps) {
  const title =
    type === "no-goals"
      ? "Confirm no goals were scored"
      : "Confirm no disciplinary sanctions"

  const description =
    type === "no-goals"
      ? "Can you confirm that no goals were scored in this match?"
      : "Can you confirm that no disciplinary sanctions/cards were issued during this match?"

  const confirmLabel =
    type === "no-goals"
      ? "Yes, no goals were scored"
      : "Yes, no cards were issued"

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="border-white/10 bg-[#0B0F0F] text-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>

          <AlertDialogDescription className="text-gray-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onCancel}
            className="border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            Go back and review
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="
              border border-yellow-400/20
              bg-yellow-500/10
              text-yellow-300
              hover:bg-yellow-500/20
              hover:text-yellow-200
              transition
            "
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}