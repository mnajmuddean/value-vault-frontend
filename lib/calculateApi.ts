export async function calculateComparison(
  itemCode: number,
  premiseCodes: number[]
) {
  // premiseCodes: array of premise_code (at least 2)
  if (!itemCode || !premiseCodes || premiseCodes.length < 2)
    throw new Error("Invalid arguments");
  const params = new URLSearchParams({
    item_code: String(itemCode),
    premise_code_1: String(premiseCodes[0]),
    premise_code_2: String(premiseCodes[1]),
  });
  // If more than 2 premises, add as premise_code_3, premise_code_4, etc.
  for (let i = 2; i < premiseCodes.length; i++) {
    params.append(`premise_code_${i + 1}`, String(premiseCodes[i]));
  }
  const url = `${
    process.env.NEXT_PUBLIC_VALUE_VAULT_API_URL
  }/api/calculate?${params.toString()}`;
  const res = await fetch(url, {
    headers: {
      "x-api-key": process.env.NEXT_PUBLIC_VALUE_VAULT_API_KEY!,
      "x-portal-id": process.env.NEXT_PUBLIC_VALUE_VAULT_API_PORTAL_ID!,
    },
  });
  if (!res.ok) throw new Error("Failed to fetch comparison");
  return res.json();
}
