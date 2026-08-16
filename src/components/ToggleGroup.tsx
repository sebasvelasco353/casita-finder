interface ToggleGroupOptionInterface {
  label: string;
  value: string;
}

interface ToggleGroupPropsInterface {
  options: ToggleGroupOptionInterface[];
  value: string;
  onChange: (value: string) => void;
}

export default function ToggleGroup({ options, value, onChange }: ToggleGroupPropsInterface) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(option.value)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm ${
              isSelected
                ? "bg-orange-47 text-gray-99 font-semibold"
                : "border border-gray-91 bg-gray-98 text-orange-18 font-medium"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
