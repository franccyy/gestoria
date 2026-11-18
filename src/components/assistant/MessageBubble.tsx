import { cn } from "@/lib/cn";
import { formatTime } from "@/lib/format";
import type { ReplyDetails } from "@/types/assistant";
import type { ChatMessage } from "@/types/conversation";
import { ReplyDetailsView } from "./ReplyDetailsView";

const ASSISTANT_STATUS_CLASSES: Record<NonNullable<ChatMessage["status"]>, string> = {
  ok: "bg-highlight",
  unavailable: "bg-warning-soft",
  error: "bg-danger-soft",
};

interface MessageBubbleProps {
  role: ChatMessage["role"];
  text: string;
  status?: ChatMessage["status"];
  details?: ReplyDetails;
  /** Data ISO; se informada, mostra o horário abaixo do balão. */
  createdAt?: string;
}

/** Balão de mensagem: assistente à esquerda, usuário à direita. */
export function MessageBubble({ role, text, status = "ok", details, createdAt }: MessageBubbleProps) {
  const isUser = role === "user";
  return (
    <div className={cn("flex flex-col", isUser ? "items-end" : "items-start")}>
      <p className="sr-only">{isUser ? "Você disse:" : "Assistente respondeu:"}</p>
      <div
        className={cn(
          "rounded-card px-5 py-3.5 text-body",
          isUser
            ? "max-w-[88%] rounded-br-sm bg-primary text-on-primary"
            : cn("w-full max-w-[94%] rounded-bl-sm text-foreground", ASSISTANT_STATUS_CLASSES[status]),
        )}
      >
        <p className="whitespace-pre-line">{text}</p>
        {details && <ReplyDetailsView details={details} />}
      </div>
      {createdAt && <span className="mt-1 px-1 text-caption text-subtle">{formatTime(createdAt)}</span>}
    </div>
  );
}
