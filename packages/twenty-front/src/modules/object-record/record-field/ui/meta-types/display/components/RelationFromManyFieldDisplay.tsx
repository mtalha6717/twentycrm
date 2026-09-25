import { useContext } from 'react';

import { RecordChipWithTotpCode } from '@/authenticator/components/RecordChipWithTotpCode';
import { findTotpFieldMetadataItem } from '@/authenticator/utils/findTotpFieldMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { MAX_RELATION_CHIPS_DISPLAYED_INLINE } from '@/object-record/record-field/ui/meta-types/display/constants/MaxRelationChipsDisplayedInline';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useRelationFromManyFieldDisplay';
import { extractTargetRecordsFromJunction } from '@/object-record/record-field/ui/utils/junction/extractTargetRecordsFromJunction';
import { isUsableJunctionConfig } from '@/object-record/record-field/ui/utils/junction/isUsableJunctionConfig';
import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';

import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isArray } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition, generateRecordChipData } =
    useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();
  const { disableChipClick, triggerEvent } = useContext(FieldContext);
  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectMetadataNameSingular } = fieldDefinition.metadata;

  const relationObjectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  const sourceObjectMetadataId = objectMetadataItems.find(
    (item) => item.nameSingular === objectMetadataNameSingular,
  )?.id;

  const junctionConfig = resolveJunctionConfig({
    settings: fieldDefinition.metadata.settings,
    relationObjectMetadataId: fieldDefinition.metadata.relationObjectMetadataId,
    relationTargetFieldMetadataId:
      fieldDefinition.metadata.relationFieldMetadataId,
    sourceObjectMetadataId,
    objectMetadataItems,
  });

  const relationObjectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === relationObjectNameSingular,
  );
  // e.g. a supplier's authenticators show their live code next to the chip
  const totpFieldMetadataItem = isDefined(relationObjectMetadataItem)
    ? findTotpFieldMetadataItem(relationObjectMetadataItem)
    : undefined;

  if (!isDefined(fieldValue)) {
    return null;
  }

  if (!isArray(fieldValue)) {
    return null;
  }

  if (!isDefined(relationObjectNameSingular)) {
    return null;
  }

  if (isDefined(junctionConfig)) {
    if (!isUsableJunctionConfig(junctionConfig)) {
      return null;
    }

    const { targetFields } = junctionConfig;

    if (targetFields.length === 0) {
      return null;
    }

    const extractedRecords = extractTargetRecordsFromJunction({
      junctionRecords: fieldValue,
      targetFields,
      objectMetadataItems,
      includeRecord: true,
    });

    const targetRecordsWithMetadata = extractedRecords
      .map((extracted) => {
        const objectMetadata = objectMetadataItems.find(
          (item) => item.id === extracted.objectMetadataId,
        );
        if (!objectMetadata || !extracted.record) {
          return null;
        }
        return { record: extracted.record, objectMetadata };
      })
      .filter(isDefined);

    if (fieldValue.some(isDefined) && targetRecordsWithMetadata.length === 0) {
      return null;
    }

    return (
      <ExpandableList
        isChipCountDisplayed={isFocused}
        maxInlineCount={MAX_RELATION_CHIPS_DISPLAYED_INLINE}
      >
        {targetRecordsWithMetadata.map(({ record, objectMetadata }) => (
          <RecordChip
            key={record.id}
            objectNameSingular={objectMetadata.nameSingular}
            record={record}
            forceDisableClick={disableChipClick}
            triggerEvent={triggerEvent}
          />
        ))}
      </ExpandableList>
    );
  }

  return (
    <ExpandableList
      isChipCountDisplayed={isFocused}
      maxInlineCount={MAX_RELATION_CHIPS_DISPLAYED_INLINE}
    >
      {fieldValue.filter(isDefined).map((record) => {
        const recordChipData = generateRecordChipData(record);
        const recordChip = (
          <RecordChip
            key={recordChipData.recordId}
            objectNameSingular={recordChipData.objectNameSingular}
            record={record}
            forceDisableClick={disableChipClick}
            triggerEvent={triggerEvent}
          />
        );

        if (!isDefined(totpFieldMetadataItem)) {
          return recordChip;
        }

        return (
          <RecordChipWithTotpCode
            key={recordChipData.recordId}
            recordChip={recordChip}
            objectNameSingular={recordChipData.objectNameSingular}
            recordId={recordChipData.recordId}
            totpFieldName={totpFieldMetadataItem.name}
          />
        );
      })}
    </ExpandableList>
  );
};
