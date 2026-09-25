import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export type AuthenticatorDialogRequest =
  | {
      mode: 'create';
      requestId: string;
      // Fields set by whoever asked for the record, e.g. { supplierId }
      initialDraftRecord: Partial<ObjectRecord>;
      defaultLabel: string;
      resolve: (createdRecord: ObjectRecord | null) => void;
    }
  | {
      mode: 'edit';
      recordId: string;
    };
