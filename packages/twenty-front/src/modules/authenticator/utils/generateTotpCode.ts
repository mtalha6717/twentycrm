import { TOTP_PERIOD_IN_SECONDS } from '@/authenticator/constants/TotpPeriodInSeconds';
import { decodeBase32 } from '@/authenticator/utils/decodeBase32';

const TOTP_DIGITS = 6;

// RFC 6238 (HMAC-SHA1, 6 digits, 30s), the default every authenticator app uses
export const generateTotpCode = async (
  secret: string,
  timestampInMilliseconds = Date.now(),
): Promise<string> => {
  const key = decodeBase32(secret);

  if (key.length === 0) {
    return '';
  }

  const counter = Math.floor(
    timestampInMilliseconds / 1000 / TOTP_PERIOD_IN_SECONDS,
  );
  const counterBuffer = new ArrayBuffer(8);
  const counterView = new DataView(counterBuffer);

  counterView.setUint32(0, Math.floor(counter / 2 ** 32));
  counterView.setUint32(4, counter >>> 0);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign'],
  );
  const mac = new Uint8Array(
    await crypto.subtle.sign('HMAC', cryptoKey, counterBuffer),
  );

  const offset = mac[mac.length - 1] & 0x0f;
  const binaryCode =
    ((mac[offset] & 0x7f) << 24) |
    (mac[offset + 1] << 16) |
    (mac[offset + 2] << 8) |
    mac[offset + 3];

  return (binaryCode % 10 ** TOTP_DIGITS).toString().padStart(TOTP_DIGITS, '0');
};
