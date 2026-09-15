import "server-only";
import { getSupabaseAdmin } from "@/src/lib/supabase/admin";

const PAGE_SIZE = 500;

async function allRows<T>(
  build: (
    from: number,
    to: number,
  ) => PromiseLike<{ data: unknown; error: unknown }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    const page = (data ?? []) as T[];
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
}

export async function getUnregisteredFinanceAccounts() {
  const db = getSupabaseAdmin();
  const [identities, transactions, links, aliases, members] = await Promise.all(
    [
      allRows<Record<string, unknown>>((from, to) =>
        db
          .schema("finance")
          .from("unregistered_referees")
          .select("*")
          .order("id")
          .range(from, to),
      ),
      allRows<Record<string, unknown>>((from, to) =>
        db
          .schema("finance")
          .from("unregistered_transactions")
          .select("*")
          .order("id")
          .range(from, to),
      ),
      allRows<Record<string, unknown>>((from, to) =>
        db
          .schema("finance")
          .from("unregistered_referee_links")
          .select("*")
          .order("id")
          .range(from, to),
      ),
      allRows<Record<string, unknown>>((from, to) =>
        db
          .schema("finance")
          .from("unregistered_arbiter_aliases")
          .select("*")
          .order("id")
          .range(from, to),
      ),
      allRows<Record<string, unknown>>((from, to) =>
        db
          .from("members")
          .select("id,full_name,email,status")
          .order("id")
          .range(from, to),
      ),
    ],
  );

  transactions.sort((left, right) =>
    `${String(right.transaction_date)}:${String(right.created_at)}`.localeCompare(
      `${String(left.transaction_date)}:${String(left.created_at)}`,
    ),
  );
  members.sort((left, right) =>
    String(left.full_name).localeCompare(String(right.full_name)),
  );

  return {
    identities,
    transactions,
    links,
    aliases,
    members,
  };
}
