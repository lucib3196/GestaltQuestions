export type DropDownBase<TValue> = {
  selected: TValue;
  setSelected: (val: TValue) => void;
  label: string;
};
