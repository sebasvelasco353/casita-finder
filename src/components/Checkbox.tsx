interface CheckboxPropsInterface {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function Checkbox({ label, checked, onChange }: CheckboxPropsInterface) {
  return (
    <label className="flex items-center gap-2 text-sm text-orange-18">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 accent-orange-47"
      />
      {label}
    </label>
  );
}
