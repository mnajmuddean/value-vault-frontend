import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  NEXT_PUBLIC_VALUE_VAULT_API_URL: z.url(),
  NEXT_PUBLIC_VALUE_VAULT_API_KEY: z.string(),
  NEXT_PUBLIC_VALUE_VAULT_API_PORTAL_ID: z.uuid(),
});
export const ENV = envSchema.parse(process.env);
