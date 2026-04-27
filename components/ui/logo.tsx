export function Logo({ showText = true }: { showText?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
        <svg width="16" height="14" viewBox="0 0 24 21" fill="none">
          <polygon points="12,0 0,21 24,21" className="fill-background" />
        </svg>
      </div>
      {showText && (
        <span className="text-[15px] font-bold text-foreground tracking-tight">
          NeuraChat
        </span>
      )}
    </div>
  );
}
