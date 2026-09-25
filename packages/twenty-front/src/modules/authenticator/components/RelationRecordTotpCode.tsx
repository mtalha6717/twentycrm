import { TotpCodeDisplay } from '@/authenticator/components/TotpCodeDisplay';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { isString } from '@sniptt/guards';

type RelationRecordTotpCodeProps = {
  objectNameSingular: string;
  recordId: string;
  totpFieldName: string;
};

// Relation cards only load the related record's label fields, so fetch the secret
export const RelationRecordTotpCode = ({
  objectNameSingular,
  recordId,
  totpFieldName,
}: RelationRecordTotpCodeProps) => {
  const { record } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
    recordGqlFields: { id: true, [totpFieldName]: true },
  });

  const secret = record?.[totpFieldName];

  return <TotpCodeDisplay secret={isString(secret) ? secret : undefined} />;
};
