export const normalizeBase32Secret = (secret: string) =>
  secret.replace(/\s/g, '').toUpperCase();
