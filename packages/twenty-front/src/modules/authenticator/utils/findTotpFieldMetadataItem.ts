import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const findTotpFieldMetadataItem = ({
  fields,
}: {
  fields: FieldMetadataItem[];
}) =>
  fields.find(
    (field) =>
      field.type === FieldMetadataType.TEXT &&
      isDefined(field.settings) &&
      'displayAs' in field.settings &&
      field.settings.displayAs === 'TOTP',
  );
