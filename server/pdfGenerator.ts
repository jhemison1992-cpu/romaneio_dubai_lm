import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface InspectionData {
  title: string;
  status: string;
  createdAt: Date;
  items: Array<{
    environmentName: string;
    caixilhoCode: string;
    caixilhoType: string;
    quantity: number;
    releaseDate: Date | null;
    responsibleConstruction: string | null;
    responsibleSupplier: string | null;
    observations: string | null;
    photos: number;
    videos: number;
  }>;
}

export async function generateInspectionPDF(data: InspectionData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Header
    doc.fontSize(20).font("Helvetica-Bold").text("ROMANEIO DE LIBERAÇÃO DE AMBIENTES", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(16).text("DUBAI LM EMPREENDIMENTOS IMOBILIÁRIOS SPE LTDA", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text("Avenida Lucianinho Melli, nº 444 – Vila Osasco – Osasco/SP", { align: "center" });
    doc.moveDown(1);

    // Inspection Info
    doc.fontSize(12).font("Helvetica-Bold").text(`Vistoria: ${data.title}`);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Data de Criação: ${format(data.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`);
    doc.text(`Status: ${getStatusLabel(data.status)}`);
    doc.moveDown(1);

    // Items
    data.items.forEach((item, index) => {
      if (index > 0 && index % 2 === 0) {
        doc.addPage();
      }

      doc.fontSize(12).font("Helvetica-Bold").text(`${index + 1}. ${item.environmentName}`, { underline: true });
      doc.moveDown(0.3);
      
      doc.fontSize(10).font("Helvetica");
      doc.text(`Caixilho: ${item.caixilhoCode}`);
      doc.text(`Tipo: ${item.caixilhoType}`, { width: 500 });
      doc.text(`Quantidade: ${item.quantity} peça(s)`);
      doc.moveDown(0.5);

      if (item.releaseDate) {
        doc.text(`Data de Liberação: ${format(item.releaseDate, "dd/MM/yyyy")}`);
      }
      if (item.responsibleConstruction) {
        doc.text(`Responsável Obra: ${item.responsibleConstruction}`);
      }
      if (item.responsibleSupplier) {
        doc.text(`Responsável Fornecedor: ${item.responsibleSupplier}`);
      }
      if (item.observations) {
        doc.text(`Observações: ${item.observations}`, { width: 500 });
      }

      doc.moveDown(0.3);
      doc.text(`Fotos anexadas: ${item.photos} | Vídeos anexados: ${item.videos}`);
      doc.moveDown(1);

      // Separator line
      doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(1);
    });

    // Footer
    doc.fontSize(8).font("Helvetica").text(
      `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  });
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "draft": return "Rascunho";
    case "in_progress": return "Em Andamento";
    case "completed": return "Concluída";
    default: return status;
  }
}
