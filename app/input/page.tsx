import { redirect } from "next/navigation";

export default function LegacyInputPage({
  searchParams
}: {
  searchParams?: { seed?: string | string[] };
}) {
  const seedValue = Array.isArray(searchParams?.seed)
    ? searchParams?.seed[0]
    : searchParams?.seed;

  if (seedValue) {
    redirect(`/think?seed=${encodeURIComponent(seedValue)}`);
  }

  redirect("/think");
}
