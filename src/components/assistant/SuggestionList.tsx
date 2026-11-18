import { Chip } from "@/components/ui/Chip";
import type { QuestionSuggestion } from "@/lib/suggestions";

interface SuggestionListProps {
  suggestions: readonly QuestionSuggestion[];
  onSelect: (suggestion: QuestionSuggestion) => void;
  disabled?: boolean;
}

/** Lista de chips com perguntas sugeridas. */
export function SuggestionList({ suggestions, onSelect, disabled }: SuggestionListProps) {
  return (
    <ul className="flex flex-wrap gap-3">
      {suggestions.map((suggestion) => (
        <li key={suggestion.label}>
          <Chip onClick={() => onSelect(suggestion)} disabled={disabled} title={suggestion.question}>
            {suggestion.label}
          </Chip>
        </li>
      ))}
    </ul>
  );
}
