export function TypingIndicator() {
  return (
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
  );
}
