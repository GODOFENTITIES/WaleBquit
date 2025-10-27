import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bot, User } from "lucide-react"

export function ChatAvatar({ role }: { role: 'user' | 'assistant' }) {
  if (role === 'user') {
    return (
      <Avatar className="size-8">
        <AvatarFallback className="bg-primary text-primary-foreground">
          <User className="size-4" />
        </AvatarFallback>
      </Avatar>
    )
  }
  return (
    <Avatar className="size-8">
      <AvatarFallback className="bg-accent text-accent-foreground">
        <Bot className="size-4" />
      </AvatarFallback>
    </Avatar>
  )
}
