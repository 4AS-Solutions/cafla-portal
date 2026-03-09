export async function matchReferee(name: string, supabase: any) {

  if (!name) return null

  const { data } = await supabase
    .from("arbiter_referees")
    .select("member_id")
    .eq("arbiter_name", name)
    .maybeSingle()

  if (!data) {

    await supabase
      .from("arbiter_referees")
      .insert({ arbiter_name: name })

    return null
  }

  return data.member_id
}