import { useOpenAuthenticatorDialog } from '@/authenticator/hooks/useOpenAuthenticatorDialog';
import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { getLabelIdentifierFieldValue } from '@/object-metadata/utils/getLabelIdentifierFieldValue';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

// The authenticator links to the selected record through its
// `<objectNameSingular>Id` join column (midId, supplierId)
export const AddAuthenticatorEngineCommand = () => {
  const { objectMetadataItem, selectedRecords } =
    useHeadlessCommandContextApi();
  const { openAuthenticatorCreationDialog } = useOpenAuthenticatorDialog();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleExecute = () => {
    const parentRecord =
      selectedRecords.length === 1 ? selectedRecords[0] : undefined;

    if (!isDefined(objectMetadataItem) || !isDefined(parentRecord)) {
      throw new Error(t`Select a single record to add an authenticator.`);
    }

    closeSidePanelMenu();
    // Not awaited: the dialog outlives this headless command
    openAuthenticatorCreationDialog({
      initialDraftRecord: {
        [`${objectMetadataItem.nameSingular}Id`]: parentRecord.id,
      },
      defaultLabel: getLabelIdentifierFieldValue(
        parentRecord,
        getLabelIdentifierFieldMetadataItem(objectMetadataItem),
      ),
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={handleExecute} />;
};
