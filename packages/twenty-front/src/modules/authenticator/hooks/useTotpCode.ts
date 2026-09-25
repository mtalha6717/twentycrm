import { TOTP_PERIOD_IN_SECONDS } from '@/authenticator/constants/TotpPeriodInSeconds';
import { generateTotpCode } from '@/authenticator/utils/generateTotpCode';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';

const getSecondsLeft = () =>
  TOTP_PERIOD_IN_SECONDS -
  (Math.floor(Date.now() / 1000) % TOTP_PERIOD_IN_SECONDS);

export const useTotpCode = (secret: string | null | undefined) => {
  const [code, setCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft);

  // A ticking clock is a subscription to time, so an effect is the right tool here
  useEffect(() => {
    if (!isNonEmptyString(secret)) {
      setCode('');
      return;
    }

    let isActive = true;

    const refresh = async () => {
      const nextCode = await generateTotpCode(secret).catch(() => '');

      if (isActive) {
        setCode(nextCode);
        setSecondsLeft(getSecondsLeft());
      }
    };

    refresh();
    const interval = setInterval(refresh, 1000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [secret]);

  return { code, secondsLeft };
};
