import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface DeliveryReportButtonProps {
  inspectionEnvironmentId: number;
  environmentName: string;
}

export const DeliveryReportButton: React.FC<DeliveryReportButtonProps> = ({
  inspectionEnvironmentId,
  environmentName,
}) => {
  // TODO: Implementar geração de PDF de termo de entrega
  // Será necessário adicionar procedure generatePDF em deliveryReceipts router
  
  const handleDownload = async () => {
    toast.info("Funcionalidade de geração de PDF será implementada em breve");
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={false}
      variant="default"
      size="sm"
      title="Gerar termo de entrega"
    >
      <>
        <Download className="w-4 h-4 mr-2" />
        Termo de Entrega
      </>
    </Button>
  );
};
