import { AUTHENTICATOR_DIALOG_ID } from '@/authenticator/constants/AuthenticatorDialogId';
import { authenticatorDialogRequestState } from '@/authenticator/states/authenticatorDialogRequestState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

// Every way of creating or opening an authenticator routes here, so they all
// get the same dialog (QR capture, manual entry, live code)
export const useOpenAuthenticatorDialog = () => {
  const store = useStore();
  const { openDialog } = useDialog();

  // A new request replaces the open one, so let an awaiting creator know it was dropped
  const settlePendingCreation = useCallback(() => {
    const currentRequest = store.get(authenticatorDialogRequestState.atom);

    if (currentRequest?.mode === 'create') {
      currentRequest.resolve(null);
    }
  }, [store]);

  const openAuthenticatorCreationDialog = useCallback(
    ({
      initialDraftRecord = {},
      defaultLabel = '',
    }: {
      initialDraftRecord?: Partial<ObjectRecord>;
      defaultLabel?: string;
    }) =>
      new Promise<ObjectRecord | null>((resolve) => {
        settlePendingCreation();
        store.set(authenticatorDialogRequestState.atom, {
          mode: 'create',
          requestId: v4(),
          initialDraftRecord,
          defaultLabel,
          resolve,
        });
        openDialog(AUTHENTICATOR_DIALOG_ID);
      }),
    [store, openDialog, settlePendingCreation],
  );

  const openAuthenticatorEditDialog = useCallback(
    (recordId: string) => {
      settlePendingCreation();
      store.set(authenticatorDialogRequestState.atom, {
        mode: 'edit',
        recordId,
      });
      openDialog(AUTHENTICATOR_DIALOG_ID);
    },
    [store, openDialog, settlePendingCreation],
  );

  return { openAuthenticatorCreationDialog, openAuthenticatorEditDialog };
};
