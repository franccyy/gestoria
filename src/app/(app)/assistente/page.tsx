import { Suspense } from "react";
import { AssistantScreen } from "@/components/assistant/AssistantScreen";
import { Loader } from "@/components/ui/Loader";

/**
 * O Suspense é exigido pelo Next.js porque a tela lê o endereço
 * (?q=pergunta) para preencher o campo com uma sugestão.
 */
export default function AssistentePage() {
  return (
    <Suspense fallback={<Loader />}>
      <AssistantScreen />
    </Suspense>
  );
}
