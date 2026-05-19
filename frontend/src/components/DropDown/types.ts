export type DropDownBase<TValue extends string> = {
  selected: TValue;
  setSelected: (val: TValue) => void;
  label: string;
};
