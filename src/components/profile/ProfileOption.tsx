import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import type { Profile } from "@/types/profile";

interface ProfileOptionProps {
  profile: Profile;
  selected: boolean;
  onSelect: () => void;
  /** Nome comum a todas as opções do grupo (botões de rádio). */
  name: string;
}

/** Opção de perfil selecionável (botão de rádio com visual de card). */
export function ProfileOption({ profile, selected, onSelect, name }: ProfileOptionProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-4 rounded-card border-thick p-4 transition-colors",
        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary",
        selected ? "border-primary bg-highlight" : "border-border bg-surface hover:border-border-strong",
      )}
    >
      <input
        type="radio"
        name={name}
        value={profile.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      <span
        aria-hidden
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-sm",
          selected ? "bg-primary text-on-primary" : "bg-surface-muted text-primary",
        )}
      >
        <Icon name={selected ? "check" : "user"} />
      </span>
      <span className="min-w-0">
        <span className="block text-lead font-medium text-foreground">{profile.label}</span>
        <span className="block text-body text-muted">{profile.description}</span>
      </span>
    </label>
  );
}
