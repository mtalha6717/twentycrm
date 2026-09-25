import { TotpCodeDisplay } from '@/authenticator/components/TotpCodeDisplay';
import { useTextFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useTextFieldDisplay';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import { TextDisplay } from 'twenty-ui/primitives/data-display';

export const TextFieldDisplay = () => {
  const { fieldValue, fieldDefinition, displayedMaxRows } =
    useTextFieldDisplay();

  const textSettings = isFieldText(fieldDefinition)
    ? fieldDefinition.metadata?.settings
    : undefined;

  if (textSettings?.displayAs === 'TOTP') {
    return <TotpCodeDisplay secret={fieldValue} />;
  }

  const displayedMaxRowsFromSettings = textSettings?.displayedMaxRows;

  const displayMaxRowCalculated = displayedMaxRows
    ? displayedMaxRows
    : displayedMaxRowsFromSettings;

  return (
    <TextDisplay text={fieldValue} displayedMaxRows={displayMaxRowCalculated} />
  );
};
