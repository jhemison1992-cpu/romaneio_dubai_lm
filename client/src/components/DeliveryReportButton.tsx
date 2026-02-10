import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DeliveryReportButtonProps {
  inspectionEnvironmentId: number;
  environmentName: string;
  installationStatus?: number; // Percentual de conclusão (0-100)
}

export const DeliveryReportButton: React.FC<DeliveryReportButtonProps> = ({
  inspectionEnvironmentId,
  environmentName,
  installationStatus = 0,
}) => {
  const isComplete = installationStatus === 100;

  const generatePDFMutation = trpc.deliveryReport.generatePDF.useMutation({
    onSuccess: (data) => {
      // Criar blob do PDF
      const blob = new Blob([data.buffer], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      
      // Criar link de download
      const link = document.createElement("a");
      link.href = url;
      link.download = `Termo_Entrega_${environmentName}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("Termo de entrega baixado com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao gerar termo de entrega: " + error.message);
    },
  });

  const handleDownload = async () => {
    if (!isComplete) {
      toast.error(`Evolução da instalação deve estar 100% para gerar termo (Atual: ${installationStatus}%)`);
      return;
    }
    await generatePDFMutation.mutate({
      inspectionEnvironmentId,
    });
  };

  return (
    <div className="flex flex-col gap-1">
      <Button
        onClick={handleDownload}
        disabled={generatePDFMutation.isPending || !isComplete}
        variant="default"
        size="sm"
        title={!isComplete ? `Evolução da instalação deve estar 100% para gerar termo (Atual: ${installationStatus}%)` : "Gerar termo de entrega"}
      >
        {generatePDFMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4 mr-2" />
            Termo de Entrega
          </>
        )}
      </Button>
      {!isComplete && (
        <span className="text-xs text-muted-foreground">
          Evolução: {installationStatus}%
        </span>
      )}
    </div>
  );
};
