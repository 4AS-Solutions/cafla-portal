import { Button } from "@/src/components/ui/button"

type SubmitSectionProps = {
  submitting: boolean
  isReadOnly: boolean
  isEdit: boolean
  hasInvalidRed: boolean
}

export default function SubmitSection({
  submitting,
  isReadOnly,
  isEdit,
  hasInvalidRed,
}: SubmitSectionProps) {
  return (
    <div className="flex justify-end">
      <Button
        size="lg"
        className="px-10"
        type="submit"
        disabled={submitting || isReadOnly || hasInvalidRed}
      >
        {isReadOnly
          ? "View Only"
          : submitting
          ? isEdit
            ? "Updating..."
            : "Submitting..."
          : isEdit
          ? "Update Match Report"
          : "Submit Match Report"}
      </Button>
    </div>
  )
}