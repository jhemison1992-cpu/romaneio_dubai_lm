import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DeliveryReportButtonProps {
  inspectionEnvironmentId: number;
  environmentName: string;
}

export const DeliveryReportButton: React.FC<DeliveryReportButtonProps> = ({
  inspectionEnvironmentId,
  environmentName,
}) => {
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
    await generatePDFMutation.mutate({
      inspectionEnvironmentId,
    });
  };

  return (
    <Button
      onClick={handleDownload}
      disabled={generatePDFMutation.isPending}
      variant="default"
      size="sm"
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
  );
};
