import { type AuthenticatorDialogRequest } from '@/authenticator/types/AuthenticatorDialogRequest';
import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export const authenticatorDialogRequestState =
  createAtomState<AuthenticatorDialogRequest | null>({
    key: 'authenticatorDialogRequestState',
    defaultValue: null,
  });
