import { createServerSupabaseClient, supabaseReadsEnabled } from "@/lib/supabase/server";
import { getMockCorrections } from "@/lib/mock-data";
import type { PublicCorrection } from "@/types/domain";

interface PublishedCorrectionRow {
  id: string;
  correction_date: string;
  description: string;
}

/** Returns the published correction log in reverse-chronological order. */
export async function getPublishedCorrections(): Promise<PublicCorrection[]> {
  if (!supabaseReadsEnabled()) return getMockCorrections();

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("published_corrections")
    .select("id, correction_date, description")
    .order("correction_date", { ascending: false });

  if (error || !data) return [];

  return (data as unknown as PublishedCorrectionRow[]).map((row) => ({
    id: row.id,
    date: row.correction_date,
    description: row.description,
  }));
}
