import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import QRCode from "qrcode";

interface InspectionItemData {
  id: number;
  environmentName: string;
  caixilhoCode: string;
  caixilhoType: string;
  quantity: number;
  releaseDate: Date | null;
  responsibleConstruction: string | null;
  responsibleSupplier: string | null;
  observations: string | null;
  signatureConstruction?: string | null;
  signatureSupplier?: string | null;
  photos: Array<{
    fileUrl: string;
    fileName: string;
    identifier: string;
    comment?: string;
  }>;
  videos: Array<{
    fileUrl: string;
    fileName: string;
  }>;
}

interface InspectionData {
  title: string;
  status: string;
  createdAt: Date;
  items: InspectionItemData[];
}

export async function generateInspectionPDF(data: InspectionData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Logo ALUMINC
    try {
      const fs = await import("fs");
      const logoPath = "/home/ubuntu/romaneio_dubai_lm/client/public/aluminc-logo.png";
      if (fs.existsSync(logoPath)) {
        const logoData = fs.readFileSync(logoPath);
        doc.image(logoData, 50, 30, { width: 80 });
      }
    } catch (error) {
      console.error("Erro ao adicionar logo:", error);
    }

    // Header
    doc.fontSize(20).font("Helvetica-Bold").fillColor("#FF5722").text("ROMANEIO DE LIBERAÇÃO DE AMBIENTES", { align: "center" });
    doc.fillColor("#000000").moveDown(0.5);
    doc.fontSize(14).font("Helvetica-Bold").text("DUBAI LM EMPREENDIMENTOS IMOBILIÁRIOS SPE LTDA", { align: "center" });
    doc.moveDown(0.3);
    doc.fontSize(10).font("Helvetica").text("Avenida Lucianinho Melli, nº 444 – Vila Osasco – Osasco/SP", { align: "center" });
    doc.moveDown(0.5);
    doc.text("Fornecedor / Instalador: ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.", { align: "center" });
    doc.text("Responsável Técnico da Obra: Eng. William", { align: "center" });
    doc.moveDown(1);

    // Inspection Info
    doc.fontSize(12).font("Helvetica-Bold").text(`Vistoria: ${data.title}`);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Data de Criação: ${format(data.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`);
    doc.text(`Status: ${getStatusLabel(data.status)}`);
    doc.moveDown(1.5);

    // Items
    for (let index = 0; index < data.items.length; index++) {
      const item = data.items[index];
      // Verificar se precisa de nova página
      if (doc.y > 650) {
        doc.addPage();
      }

      // Título do ambiente
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#FF5722").text(`${index + 1}. ${item.environmentName}`, { underline: true });
      doc.fillColor("#000000").moveDown(0.5);
      
      // Informações do caixilho
      doc.fontSize(10).font("Helvetica");
      doc.text(`Caixilho: ${item.caixilhoCode} - ${item.caixilhoType}`, { width: 500 });
      doc.text(`Quantidade: ${item.quantity} peça(s)`);
      doc.moveDown(0.5);

      // Dados de liberação
      if (item.releaseDate) {
        doc.font("Helvetica-Bold").text("Data de Liberação: ", { continued: true });
        doc.font("Helvetica").text(format(item.releaseDate, "dd/MM/yyyy"));
      }
      if (item.responsibleConstruction) {
        doc.font("Helvetica-Bold").text("Responsável da Obra: ", { continued: true });
        doc.font("Helvetica").text(item.responsibleConstruction);
      }
      if (item.responsibleSupplier) {
        doc.font("Helvetica-Bold").text("Responsável do Fornecedor: ", { continued: true });
        doc.font("Helvetica").text(item.responsibleSupplier);
      }
      if (item.observations) {
        doc.moveDown(0.3);
        doc.font("Helvetica-Bold").text("Observações:");
        doc.font("Helvetica").text(item.observations, { indent: 20, width: 480 });
      }

      // Mídias anexadas
      if (item.photos.length > 0 || item.videos.length > 0) {
        doc.moveDown(0.3);
        doc.font("Helvetica-Bold").text("Mídias Anexadas: ", { continued: true });
        doc.font("Helvetica").text(`${item.photos.length} foto(s), ${item.videos.length} vídeo(s)`);
        
        if (item.photos.length > 0) {
          doc.moveDown(0.5);
          doc.font("Helvetica-Bold").fontSize(10).text("Fotos:");
          doc.moveDown(0.3);
          
          const photoWidth = 80;
          const photoHeight = 60;
          let x = doc.page.margins.left;
          let y = doc.y;
          
          for (const photo of item.photos) {
            try {
              const axios = await import("axios");
              const response = await axios.default.get(photo.fileUrl, { 
                responseType: "arraybuffer",
                timeout: 10000 
              });
              const buffer = response.data;
              
              if (x + photoWidth + 10 > doc.page.width - doc.page.margins.right) {
                x = doc.page.margins.left;
                y += photoHeight + 20;
              }
              
              if (y + photoHeight + 30 > doc.page.height - doc.page.margins.bottom) {
                doc.addPage();
                x = doc.page.margins.left;
                y = doc.page.margins.top;
              }
              
              doc.image(buffer, x, y, { width: photoWidth, height: photoHeight });
              doc.fontSize(7).text(photo.identifier, x, y + photoHeight + 2, { width: photoWidth, align: "center" });
              
              x += photoWidth + 10;
            } catch (error) {
              console.error(`Erro ao carregar foto ${photo.fileName}:`, error);
              doc.rect(x, y, photoWidth, photoHeight).stroke("#ccc");
              doc.fontSize(7).fillColor("#999").text("Foto nao disponivel", x, y + photoHeight / 2 - 5, { width: photoWidth, align: "center" });
              x += photoWidth + 10;
            }
          }
          
          doc.y = y + photoHeight + 20;
        }
      }

      // Assinaturas
      if (item.signatureConstruction || item.signatureSupplier) {
        doc.moveDown(1);
        
        // Verificar se há espaço suficiente para assinaturas
        if (doc.y > 600) {
          doc.addPage();
        }
        
        doc.font("Helvetica-Bold").fontSize(10).text("Assinaturas:");
        doc.moveDown(0.5);
        
        const startY = doc.y;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
        const signatureWidth = (pageWidth / 2) - 15;
        const signatureHeight = 70;
        
        // Assinatura da Obra
        if (item.signatureConstruction) {
          try {
            const sigData = item.signatureConstruction.split(',')[1];
            if (sigData) {
              const sigBuffer = Buffer.from(sigData, 'base64');
              doc.image(sigBuffer, doc.page.margins.left, startY, { 
                width: signatureWidth, 
                height: signatureHeight,
                fit: [signatureWidth, signatureHeight]
              });
              doc.fontSize(8).font("Helvetica").text(
                "Responsável da Obra", 
                doc.page.margins.left, 
                startY + signatureHeight + 5, 
                { width: signatureWidth, align: 'center' }
              );
              // Linha para assinatura
              doc.strokeColor("#000000").lineWidth(0.5)
                .moveTo(doc.page.margins.left, startY + signatureHeight)
                .lineTo(doc.page.margins.left + signatureWidth, startY + signatureHeight)
                .stroke();
            }
          } catch (err) {
            console.error('Erro ao adicionar assinatura da obra:', err);
          }
        }
        
        // Assinatura do Fornecedor
        if (item.signatureSupplier) {
          try {
            const sigData = item.signatureSupplier.split(',')[1];
            if (sigData) {
              const sigBuffer = Buffer.from(sigData, 'base64');
              const xPos = doc.page.margins.left + signatureWidth + 30;
              doc.image(sigBuffer, xPos, startY, { 
                width: signatureWidth, 
                height: signatureHeight,
                fit: [signatureWidth, signatureHeight]
              });
              doc.fontSize(8).font("Helvetica").text(
                "Responsável do Fornecedor", 
                xPos, 
                startY + signatureHeight + 5, 
                { width: signatureWidth, align: 'center' }
              );
              // Linha para assinatura
              doc.strokeColor("#000000").lineWidth(0.5)
                .moveTo(xPos, startY + signatureHeight)
                .lineTo(xPos + signatureWidth, startY + signatureHeight)
                .stroke();
            }
          } catch (err) {
            console.error('Erro ao adicionar assinatura do fornecedor:', err);
          }
        }
        
        doc.moveDown(6);
      }

      // Separator line
      if (index < data.items.length - 1) {
        doc.strokeColor("#cccccc").lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(doc.page.width - 50, doc.y)
          .stroke();
        doc.moveDown(1);
      }
    }

    // Footer com QR Code
    const footerY = doc.page.height - 80;
    
    // Gerar QR Code
    try {
      const qrCodeUrl = "https://3000-iotwzrafbzkv3jg6xnofa-bd32e2ea.us2.manus.computer";
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeUrl, {
        width: 60,
        margin: 1,
        color: {
          dark: "#000000",
          light: "#FFFFFF"
        }
      });
      
      // Adicionar QR Code no canto direito
      const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
      doc.image(qrCodeBuffer, doc.page.width - 110, footerY - 10, { width: 60 });
      
      // Texto ao lado do QR Code
      doc.fontSize(7).font("Helvetica").fillColor("#666666").text(
        "Acesse o sistema:",
        doc.page.width - 110,
        footerY + 52,
        { width: 60, align: "center" }
      );
    } catch (error) {
      console.error("Erro ao gerar QR Code:", error);
    }
    
    // Data de geração
    doc.fontSize(8).font("Helvetica").fillColor("#666666").text(
      `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      50,
      footerY + 20,
      { width: doc.page.width - 170, align: "left" }
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
