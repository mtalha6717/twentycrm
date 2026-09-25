import { RelationRecordTotpCode } from '@/authenticator/components/RelationRecordTotpCode';
import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.span`
  align-items: center;
  display: inline-flex;
  gap: ${themeCssVariables.spacing[2]};
  max-width: 100%;
`;

type RecordChipWithTotpCodeProps = {
  recordChip: ReactNode;
  objectNameSingular: string;
  recordId: string;
  totpFieldName: string;
};

export const RecordChipWithTotpCode = ({
  recordChip,
  objectNameSingular,
  recordId,
  totpFieldName,
}: RecordChipWithTotpCodeProps) => (
  <StyledContainer>
    {recordChip}
    <RelationRecordTotpCode
      objectNameSingular={objectNameSingular}
      recordId={recordId}
      totpFieldName={totpFieldName}
    />
  </StyledContainer>
);
