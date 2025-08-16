export async function searchPremises(keyword: string) {
  const res = await fetch(
    `${
      process.env.NEXT_PUBLIC_VALUE_VAULT_API_URL
    }/api/premises/search?key=${encodeURIComponent(keyword)}`,
    {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_VALUE_VAULT_API_KEY!,
        "x-portal-id": process.env.NEXT_PUBLIC_VALUE_VAULT_API_PORTAL_ID!,
      },
    }
  );
  if (!res.ok) throw new Error("Failed to fetch premises search results");
  return res.json();
}
