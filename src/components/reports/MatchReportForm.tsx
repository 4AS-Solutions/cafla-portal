"use client"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { createClient } from "@/src/lib/supabase/client"

import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Textarea } from "@/src/components/ui/textarea"

const schema = z.object({

  home_score: z.number().min(0),
  away_score: z.number().min(0),
  comments: z.string().optional()

})

type FormData = z.infer<typeof schema>

export function MatchReportForm({ match }: { match: any }) {

  const supabase = createClient()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      home_score: 0,
      away_score: 0,
      comments: ""
    }
  })

  async function onSubmit(values: FormData) {

    await supabase.from("match_reports").insert({
      match_id: match.id,
      home_score: values.home_score,
      away_score: values.away_score,
      comments: values.comments
    })

    alert("Report submitted")
  }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="space-y-6"
    >

      <div className="grid grid-cols-2 gap-4">

        <div>
          <label className="text-sm">
            Home Score
          </label>

          <Input
            type="number"
            {...form.register("home_score", { valueAsNumber: true })}
          />

        </div>

        <div>
          <label className="text-sm">
            Away Score
          </label>

          <Input
            type="number"
            {...form.register("away_score", { valueAsNumber: true })}
          />

        </div>

      </div>

      <div>
        <label className="text-sm">
          Comments
        </label>

        <Textarea
          {...form.register("comments")}
        />

      </div>

      <Button type="submit">
        Submit Report
      </Button>

    </form>
  )
}