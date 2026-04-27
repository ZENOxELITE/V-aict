'use client';

interface PillGroupProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function PillGroup<T extends string>({ options, value, onChange }: PillGroupProps<T>) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`
            px-4 py-2 rounded-full text-[13px] font-medium transition-all
            ${value === option.value 
              ? 'bg-white text-black' 
              : 'bg-[#111] border border-white/8 text-[#888] hover:border-white/22 hover:text-white'}
          `}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
