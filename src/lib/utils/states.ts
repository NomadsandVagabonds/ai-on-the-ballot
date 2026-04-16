/** U.S. state abbreviation ↔ name mapping */

export const STATE_MAP: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

/** Reverse lookup: full name → abbreviation */
export const NAME_TO_ABBR: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_MAP).map(([abbr, name]) => [name, abbr])
);

export function stateNameToSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

export function stateAbbrToSlug(abbr: string): string {
  const name = STATE_MAP[abbr.toUpperCase()];
  return name ? stateNameToSlug(name) : abbr.toLowerCase();
}

export function stateSlugToName(slug: string): string | undefined {
  const name = Object.values(STATE_MAP).find(
    (n) => stateNameToSlug(n) === slug
  );
  return name;
}

export function stateSlugToAbbr(slug: string): string | undefined {
  const name = stateSlugToName(slug);
  return name ? NAME_TO_ABBR[name] : undefined;
}

/** Validate a 5-digit US zip code */
export function isValidZipCode(zip: string): boolean {
  return /^\d{5}$/.test(zip.trim());
}
