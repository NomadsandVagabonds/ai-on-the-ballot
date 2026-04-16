import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search AI on the Ballot for candidates, races, and states to explore their AI governance positions.",
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
