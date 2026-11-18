import type { InputHTMLAttributes } from "react";
import { Icon } from "./Icon";
import { IconButton } from "./IconButton";
import { TextField } from "./TextField";

interface SearchFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "onChange" | "type"> {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  hideLabel?: boolean;
  hint?: string;
}

/** Campo de pesquisa: ícone de lupa à esquerda e botão para limpar à direita. */
export function SearchField({ label, value, onValueChange, hideLabel, hint, ...rest }: SearchFieldProps) {
  return (
    <TextField
      type="search"
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      autoComplete="off"
      value={value}
      onChange={(event) => onValueChange(event.target.value)}
      startAdornment={<Icon name="search" className="size-5 text-subtle" />}
      endAdornment={
        value ? <IconButton icon="close" label="Limpar pesquisa" variant="soft" className="size-11" onClick={() => onValueChange("")} /> : null
      }
      {...rest}
    />
  );
}
