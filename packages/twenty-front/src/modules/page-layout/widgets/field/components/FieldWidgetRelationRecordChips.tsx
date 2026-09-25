import { RecordChipWithTotpCode } from '@/authenticator/components/RecordChipWithTotpCode';
import { findTotpFieldMetadataItem } from '@/authenticator/utils/findTotpFieldMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordChip } from '@/object-record/components/RecordChip';
import { type FieldWidgetRelationRecord } from '@/page-layout/widgets/field/types/FieldWidgetRelationRecord';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  box-sizing: border-box;
  padding: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledRelationChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
`;

type FieldWidgetRelationRecordChipsProps = {
  relationRecords: FieldWidgetRelationRecord[];
  isInSidePanel: boolean;
};

export const FieldWidgetRelationRecordChips = ({
  relationRecords,
  isInSidePanel,
}: FieldWidgetRelationRecordChipsProps) => {
  const { objectMetadataItems } = useObjectMetadataItems();

  if (relationRecords.length === 0) {
    return null;
  }

  return (
    <SidePanelProvider value={{ isInSidePanel }}>
      <StyledContainer>
        <StyledRelationChipsContainer>
          {relationRecords.map(({ record, objectNameSingular }) => {
            const recordChip = (
              <RecordChip
                key={`${objectNameSingular}-${record.id}`}
                objectNameSingular={objectNameSingular}
                record={record}
              />
            );

            const relationObjectMetadataItem = objectMetadataItems.find(
              (item) => item.nameSingular === objectNameSingular,
            );
            const totpFieldMetadataItem = isDefined(relationObjectMetadataItem)
              ? findTotpFieldMetadataItem(relationObjectMetadataItem)
              : undefined;

            if (!isDefined(totpFieldMetadataItem)) {
              return recordChip;
            }

            return (
              <RecordChipWithTotpCode
                key={`${objectNameSingular}-${record.id}`}
                recordChip={recordChip}
                objectNameSingular={objectNameSingular}
                recordId={record.id}
                totpFieldName={totpFieldMetadataItem.name}
              />
            );
          })}
        </StyledRelationChipsContainer>
      </StyledContainer>
    </SidePanelProvider>
  );
};
