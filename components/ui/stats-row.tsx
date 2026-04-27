interface Stat {
  label: string;
  value: string | number;
}

interface StatsRowProps {
  stats: Stat[];
}

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div className="flex flex-wrap border border-white/8 rounded-lg overflow-hidden">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`
            flex-1 min-w-[120px] p-4 text-center
            ${index !== stats.length - 1 ? 'border-r border-white/8' : ''}
            max-md:min-w-[50%] max-md:border-b max-md:border-white/8
          `}
        >
          <div className="text-2xl font-mono font-semibold text-white mb-1">
            {stat.value}
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-[#888]">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
