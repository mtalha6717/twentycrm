import { AuthenticatorDialog } from '@/authenticator/components/AuthenticatorDialog';
import { AUTHENTICATOR_DIALOG_ID } from '@/authenticator/constants/AuthenticatorDialogId';
import { AUTHENTICATOR_OBJECT_NAME_SINGULAR } from '@/authenticator/constants/AuthenticatorObjectNameSingular';
import { authenticatorDialogRequestState } from '@/authenticator/states/authenticatorDialogRequestState';
import { type AuthenticatorDialogRequest } from '@/authenticator/types/AuthenticatorDialogRequest';
import { type AuthenticatorFormValues } from '@/authenticator/types/AuthenticatorFormValues';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { isString } from '@sniptt/guards';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/primitives/feedback';

const useCloseAuthenticatorDialog = () => {
  const store = useStore();
  const { closeDialog } = useDialog();

  return () => {
    closeDialog(AUTHENTICATOR_DIALOG_ID);
    store.set(authenticatorDialogRequestState.atom, null);
  };
};

const AuthenticatorCreationDialog = ({
  request,
}: {
  request: Extract<AuthenticatorDialogRequest, { mode: 'create' }>;
}) => {
  const closeAuthenticatorDialog = useCloseAuthenticatorDialog();
  const { enqueueToast } = useToast();
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: AUTHENTICATOR_OBJECT_NAME_SINGULAR,
  });

  const handleClose = () => {
    request.resolve(null);
    closeAuthenticatorDialog();
  };

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    const createdRecord = await createOneRecord({
      ...request.initialDraftRecord,
      ...values,
    });

    enqueueToast({ variant: 'success', children: t`Authenticator added.` });
    request.resolve(createdRecord);
    closeAuthenticatorDialog();
  };

  return (
    <AuthenticatorDialog
      dialogId={AUTHENTICATOR_DIALOG_ID}
      title={t`Add authenticator`}
      initialValues={{
        authLabel: request.defaultLabel,
        issuer: request.defaultLabel,
        secretSeed: '',
      }}
      onSubmit={handleSubmit}
      onClose={handleClose}
    />
  );
};

const AuthenticatorEditDialog = ({ recordId }: { recordId: string }) => {
  const closeAuthenticatorDialog = useCloseAuthenticatorDialog();
  const { enqueueToast } = useToast();
  const { updateOneRecord } = useUpdateOneRecord();
  const { record, loading } = useFindOneRecord({
    objectNameSingular: AUTHENTICATOR_OBJECT_NAME_SINGULAR,
    objectRecordId: recordId,
    recordGqlFields: {
      id: true,
      authLabel: true,
      issuer: true,
      secretSeed: true,
    },
  });

  if (loading || !isDefined(record)) {
    return null;
  }

  const handleSubmit = async (values: AuthenticatorFormValues) => {
    await updateOneRecord({
      objectNameSingular: AUTHENTICATOR_OBJECT_NAME_SINGULAR,
      idToUpdate: recordId,
      updateOneRecordInput: values,
    });

    enqueueToast({ variant: 'success', children: t`Authenticator updated.` });
    closeAuthenticatorDialog();
  };

  return (
    <AuthenticatorDialog
      dialogId={AUTHENTICATOR_DIALOG_ID}
      title={t`Edit authenticator`}
      initialValues={{
        authLabel: isString(record.authLabel) ? record.authLabel : '',
        issuer: isString(record.issuer) ? record.issuer : '',
        secretSeed: isString(record.secretSeed) ? record.secretSeed : '',
      }}
      onSubmit={handleSubmit}
      onClose={closeAuthenticatorDialog}
    />
  );
};

// Mounted once for the workspace; useOpenAuthenticatorDialog decides what it shows
export const AuthenticatorDialogHost = () => {
  const authenticatorDialogRequest = useAtomStateValue(
    authenticatorDialogRequestState,
  );

  if (!isDefined(authenticatorDialogRequest)) {
    return null;
  }

  return authenticatorDialogRequest.mode === 'create' ? (
    <AuthenticatorCreationDialog
      key={authenticatorDialogRequest.requestId}
      request={authenticatorDialogRequest}
    />
  ) : (
    <AuthenticatorEditDialog
      key={authenticatorDialogRequest.recordId}
      recordId={authenticatorDialogRequest.recordId}
    />
  );
};
