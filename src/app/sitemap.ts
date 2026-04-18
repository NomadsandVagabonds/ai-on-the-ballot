import type { MetadataRoute } from "next";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { RaceRow, CandidateRow, IssueRow } from "@/types/database";
import { stateAbbrToSlug } from "@/lib/utils/states";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://aiontheballot.com";

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/map`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/corrections`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];

  // Dynamic pages from Supabase
  let dynamicPages: MetadataRoute.Sitemap = [];

  try {
    const supabase = await createServerSupabaseClient();

    // Fetch all races to derive state pages and race pages
    const { data: rawRaces } = await supabase
      .from("races")
      .select("slug, state, updated_at");

    const races = (rawRaces ?? []) as unknown as Pick<
      RaceRow,
      "slug" | "state" | "updated_at"
    >[];

    // State pages (deduplicated)
    const stateSet = new Set<string>();
    for (const race of races) {
      stateSet.add(race.state);
    }

    const statePages: MetadataRoute.Sitemap = [...stateSet].map((abbr) => ({
      url: `${baseUrl}/state/${stateAbbrToSlug(abbr)}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // Race pages
    const racePages: MetadataRoute.Sitemap = races.map((race) => ({
      url: `${baseUrl}/race/${race.slug}`,
      lastModified: race.updated_at ? new Date(race.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Candidate pages
    const { data: rawCandidates } = await supabase
      .from("candidates")
      .select("slug, updated_at");

    const candidates = (rawCandidates ?? []) as unknown as Pick<
      CandidateRow,
      "slug" | "updated_at"
    >[];

    const candidatePages: MetadataRoute.Sitemap = candidates.map((c) => ({
      url: `${baseUrl}/candidate/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    // Issue pages
    const { data: rawIssues } = await supabase
      .from("issues")
      .select("slug, updated_at");
    const issues = (rawIssues ?? []) as unknown as Pick<
      IssueRow,
      "slug" | "updated_at"
    >[];
    const issuePages: MetadataRoute.Sitemap = issues.map((iss) => ({
      url: `${baseUrl}/issue/${iss.slug}`,
      lastModified: iss.updated_at ? new Date(iss.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.85,
    }));

    dynamicPages = [
      ...statePages,
      ...issuePages,
      ...racePages,
      ...candidatePages,
    ];
  } catch {
    // If Supabase is unreachable, return static pages only
  }

  return [...staticPages, ...dynamicPages];
}
