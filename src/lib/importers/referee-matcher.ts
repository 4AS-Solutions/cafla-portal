export async function matchReferee(
  name: string,
  supabase: any,
  members: { id: string; full_name: string }[]
) {

  if (!name) return null

  function normalize(str: string) {
    return str
      .toLowerCase()
      .replace(/\./g, "")
      .replace(/\s+/g, " ")
      .trim()
  }

  const cleanName = name.trim()
  const normalizedInput = normalize(cleanName)

  // =========================
  // 1. CHECK arbiter_referees
  // =========================
  const { data: existing } = await supabase
    .from("arbiter_referees")
    .select("member_id, arbiter_name")
    .ilike("arbiter_name", cleanName)
    .maybeSingle()

  if (existing?.member_id) {
    return existing.member_id
  }

  // =========================
  // 2. MATCH AGAINST MEMBERS
  // =========================
  const match = members.find(m =>
    normalize(m.full_name) === normalizedInput
  )

  if (match) {

    // 🔗 crear vínculo automático
    await supabase.from("arbiter_referees").upsert({
      arbiter_name: cleanName,
      member_id: match.id,
    })

    return match.id
  }

  // =========================
  // 3. NO MATCH → SAVE RAW
  // =========================
  await supabase.from("arbiter_referees").upsert({
    arbiter_name: cleanName,
    member_id: null,
  })

  return null
}