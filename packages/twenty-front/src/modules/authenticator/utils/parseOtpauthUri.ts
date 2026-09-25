import { type OtpauthParameters } from '@/authenticator/types/OtpauthParameters';
import { normalizeBase32Secret } from '@/authenticator/utils/normalizeBase32Secret';
import { isNonEmptyString } from '@sniptt/guards';

export const parseOtpauthUri = (uri: string): OtpauthParameters => {
  const url = new URL(uri.trim());

  if (url.protocol !== 'otpauth:') {
    throw new Error('Not an otpauth URI');
  }

  const secret = normalizeBase32Secret(url.searchParams.get('secret') ?? '');

  if (!isNonEmptyString(secret)) {
    throw new Error('The otpauth URI has no secret');
  }

  // Label is "Issuer:account" or just "account"; the issuer param wins
  const label = decodeURIComponent(url.pathname.replace(/^\/+/, ''));
  const [labelIssuer, ...accountParts] = label.split(':');
  const hasIssuerPrefix = accountParts.length > 0;

  return {
    issuer:
      url.searchParams.get('issuer') ?? (hasIssuerPrefix ? labelIssuer : ''),
    account: hasIssuerPrefix ? accountParts.join(':').trim() : label,
    secret,
  };
};
