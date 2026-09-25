import { useTotpCode } from '@/authenticator/hooks/useTotpCode';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const EXPIRING_SOON_THRESHOLD_IN_SECONDS = 5;

const StyledContainer = styled.span`
  align-items: baseline;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledCode = styled.span<{ $size: 'md' | 'lg' }>`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.code.font.family};
  font-size: ${({ $size }) =>
    $size === 'lg'
      ? themeCssVariables.font.size.xl
      : themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  letter-spacing: 0.08em;
`;

const StyledExpiry = styled.span<{ $isExpiringSoon: boolean }>`
  color: ${({ $isExpiringSoon }) =>
    $isExpiringSoon
      ? themeCssVariables.color.red
      : themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

type TotpCodeDisplayProps = {
  secret: string | null | undefined;
  size?: 'md' | 'lg';
};

export const TotpCodeDisplay = ({
  secret,
  size = 'md',
}: TotpCodeDisplayProps) => {
  const { code, secondsLeft } = useTotpCode(secret);

  if (!isNonEmptyString(code)) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledCode $size={size}>
        {code.slice(0, 3)} {code.slice(3)}
      </StyledCode>
      <StyledExpiry
        $isExpiringSoon={secondsLeft <= EXPIRING_SOON_THRESHOLD_IN_SECONDS}
      >
        {secondsLeft}s
      </StyledExpiry>
    </StyledContainer>
  );
};
