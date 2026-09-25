import { MultipleRecordPickerComponentInstanceContext } from '@/object-record/record-picker/multiple-record-picker/states/contexts/MultipleRecordPickerComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

// Extra filter on the pickable (not yet picked) records, from the relation field's
// recordPickerFilter setting
export const multipleRecordPickerRecordFilterComponentState =
  createAtomComponentState<RecordGqlOperationFilter | null>({
    key: 'multipleRecordPickerRecordFilterComponentState',
    defaultValue: null,
    componentInstanceContext: MultipleRecordPickerComponentInstanceContext,
  });
