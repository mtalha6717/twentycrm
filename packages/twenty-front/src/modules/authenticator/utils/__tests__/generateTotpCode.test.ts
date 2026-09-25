/**
 * @jest-environment node
 */
import { generateTotpCode } from '@/authenticator/utils/generateTotpCode';
import { parseOtpauthUri } from '@/authenticator/utils/parseOtpauthUri';

// RFC 6238 appendix B: ASCII "12345678901234567890" (base32 below) at T=59s
// gives 94287082 for 8 digits, so 287082 for 6
const RFC_6238_SECRET = 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ';

describe('generateTotpCode', () => {
  it('should match the RFC 6238 SHA-1 test vector', async () => {
    expect(await generateTotpCode(RFC_6238_SECRET, 59_000)).toBe('287082');
  });

  it('should return an empty string for an empty secret', async () => {
    expect(await generateTotpCode('', 59_000)).toBe('');
  });
});

describe('parseOtpauthUri', () => {
  it('should read issuer, account and secret', () => {
    expect(
      parseOtpauthUri(
        'otpauth://totp/Geidea:darien%40lupapay.com?secret=jbsw%20y3dp&issuer=Geidea',
      ),
    ).toEqual({
      issuer: 'Geidea',
      account: 'darien@lupapay.com',
      secret: 'JBSWY3DP',
    });
  });

  it('should reject a non otpauth URI', () => {
    expect(() => parseOtpauthUri('https://example.com')).toThrow();
  });
});
