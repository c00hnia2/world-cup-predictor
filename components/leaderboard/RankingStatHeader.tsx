interface RankingStatHeaderProps {
  label: string;
  tooltip: string;
  className?: string;
}

export function RankingStatHeader({
  label,
  tooltip,
  className = "w-16 px-2 py-3 text-center font-semibold text-zinc-700 dark:text-zinc-300 sm:w-20 sm:px-4",
}: RankingStatHeaderProps) {
  return (
    <th scope="col" className={className} title={tooltip}>
      <span className="sr-only">{tooltip}</span>
      {label}
    </th>
  );
}
