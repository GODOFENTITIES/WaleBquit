export function ThinkingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      <span className="size-1.5 rounded-full bg-current animate-bounce" />
      <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
      <span className="size-1.5 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
    </div>
  )
}
