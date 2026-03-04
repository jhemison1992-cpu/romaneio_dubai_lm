import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PDFReportGeneratorProps {
  projectId: number;
  projectName: string;
  environmentCount: number;
  completedCount: number;
  onGenerate?: () => void;
}

export const PDFReportGenerator: React.FC<PDFReportGeneratorProps> = ({
  projectId,
  projectName,
  environmentCount,
  completedCount,
  onGenerate,
}) => {
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      // Simular geração de PDF
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Criar um blob de PDF simulado
      const pdfContent = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
4 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
5 0 obj
<< /Length 200 >>
stream
BT
/F1 12 Tf
50 750 Td
(Relatório de Projeto - ${projectName}) Tj
0 -20 Td
(Total de Ambientes: ${environmentCount}) Tj
0 -20 Td
(Ambientes Concluídos: ${completedCount}) Tj
0 -20 Td
(Taxa de Conclusão: ${Math.round((completedCount / environmentCount) * 100)}%) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000214 00000 n
0000000301 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
551
%%EOF
      `;

      const blob = new Blob([pdfContent], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório gerado com sucesso!');
      onGenerate?.();
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerateReport}
      disabled={isGenerating}
      className="bg-teal-600 hover:bg-teal-700"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Gerando...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório PDF
        </>
      )}
    </Button>
  );
};
