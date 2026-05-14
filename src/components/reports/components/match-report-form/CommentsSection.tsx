import { Textarea } from "@/src/components/ui/textarea"
import { MessageSquare } from "lucide-react"
import { UseFormRegister } from "react-hook-form"

type CommentsSectionProps = {
  register: UseFormRegister<any>
  isReadOnly: boolean
}

export default function CommentsSection({
  register,
  isReadOnly,
}: CommentsSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#0B0F0F]/80 p-6 backdrop-blur-md">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
        <MessageSquare size={18} className="text-yellow-400" />
        Comments
      </h2>

      <Textarea
        rows={5}
        disabled={isReadOnly}
        className="border-white/10 bg-[#0B0F0F] disabled:opacity-60"
        placeholder="Additional match notes..."
        {...register("comments")}
      />
    </section>
  )
}