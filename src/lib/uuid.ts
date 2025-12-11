/**
 * UUID generation utility using native crypto.randomUUID()
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
