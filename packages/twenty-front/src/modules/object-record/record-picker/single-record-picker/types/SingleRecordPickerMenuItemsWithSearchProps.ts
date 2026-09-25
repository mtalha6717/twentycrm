import { type SingleRecordPickerMenuItemsProps } from '@/object-record/record-picker/single-record-picker/components/SingleRecordPickerMenuItems';
import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

export type SingleRecordPickerMenuItemsWithSearchProps = {
  excludedRecordIds?: string[];
  additionalFilter?: ObjectRecordFilterInput;
  onCreate?: ((searchInput?: string) => void) | (() => void);
  objectNameSingulars: string[];
  recordPickerInstanceId?: string;
  layoutDirection?: RecordPickerLayoutDirection;
  focusId: string;
} & Pick<
  SingleRecordPickerMenuItemsProps,
  'EmptyIcon' | 'emptyLabel' | 'onCancel' | 'onMorphItemSelected'
>;
