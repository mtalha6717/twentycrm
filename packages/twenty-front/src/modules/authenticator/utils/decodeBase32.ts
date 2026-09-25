const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export const decodeBase32 = (input: string): Uint8Array<ArrayBuffer> => {
  const cleanedInput = input
    .replace(/=+$/, '')
    .replace(/\s/g, '')
    .toUpperCase();

  let bitCount = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const character of cleanedInput) {
    const characterIndex = BASE32_ALPHABET.indexOf(character);

    if (characterIndex < 0) {
      continue;
    }

    value = (value << 5) | characterIndex;
    bitCount += 5;

    if (bitCount >= 8) {
      bytes.push((value >>> (bitCount - 8)) & 0xff);
      bitCount -= 8;
    }
  }

  return new Uint8Array(bytes);
};
