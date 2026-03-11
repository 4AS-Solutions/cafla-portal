export async function matchReferee(name: string, supabase: any) {

  if (!name) return null

  const cleanName = name.trim()

  const { data } = await supabase
    .from("arbiter_referees")
    .select("member_id")
    .eq("arbiter_name", cleanName)
    .maybeSingle()

  if (!data) {

    await supabase
      .from("arbiter_referees")
      .insert({ arbiter_name: cleanName })

    return null
  }

  return data.member_id
}