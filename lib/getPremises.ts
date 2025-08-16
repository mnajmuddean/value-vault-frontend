import { ENV } from "@/env";

// lib/searchApi.ts
export async function getPremises() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_VALUE_VAULT_API_URL}/api/premises`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NEXT_PUBLIC_VALUE_VAULT_API_KEY!,
        "x-portal-id": process.env.NEXT_PUBLIC_VALUE_VAULT_API_PORTAL_ID!,
      },
    }
  );

  if (!res.ok) throw new Error("Failed to fetch search results");
  return res.json();
}
