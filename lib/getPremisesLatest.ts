export async function getPremisesLatest(premise_code: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_VALUE_VAULT_API_URL}/api/premises/${premise_code}/latest`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_VALUE_VAULT_API_KEY!,
        "x-portal-id": process.env.NEXT_PUBLIC_VALUE_VAULT_API_PORTAL_ID!,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch latest price data");
  return res.json();
}
