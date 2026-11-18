import { Suspense } from "react";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";
import { Loader } from "@/components/ui/Loader";

/**
 * O Suspense é exigido pelo Next.js porque a tela lê o endereço
 * (?produto=código) para saber o produto escolhido na busca.
 */
export default function IndicadoresPage() {
  return (
    <Suspense fallback={<Loader />}>
      <DashboardScreen />
    </Suspense>
  );
}
