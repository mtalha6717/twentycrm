import { normalizeBase32Secret } from '@/authenticator/utils/normalizeBase32Secret';

export const isValidBase32Secret = (secret: string) =>
  /^[A-Z2-7]+=*$/.test(normalizeBase32Secret(secret));
