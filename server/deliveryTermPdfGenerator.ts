import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DeliveryTermData {
  environment: {
    name: string;
    caixilhoCode: string;
    caixilhoType: string;
    quantity: number;
    startDate: Date | null;
    endDate: Date | null;
  };
  project: {
    name: string;
    address: string;
    contractor: string;
    technicalManager: string;
  };
  installationSteps: Array<{
    stepName: string;
    isCompleted: number;
    completedAt: Date | null;
  }>;
  media: Array<{
    fileUrl: string;
    fileName: string;
    mediaType: "photo" | "video";
    comment: string | null;
  }>;
  deliveryTerm: {
    responsibleName: string;
    signature: string;
  };
}

export async function generateDeliveryTermPDF(data: DeliveryTermData): Promise<Buffer> {
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
    doc.fontSize(18).font("Helvetica-Bold").fillColor("#1e40af").text("TERMO DE ENTREGA DE INSTALAÇÃO", { align: "center" });
    doc.fillColor("#000000").moveDown(0.5);
    doc.fontSize(12).font("Helvetica-Bold").text("ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.", { align: "center" });
    doc.moveDown(1.5);

    // Informações da Obra
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text("Dados da Obra");
    doc.fillColor("#000000").moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Obra: ${data.project.name}`);
    doc.text(`Endereço: ${data.project.address}`);
    doc.text(`Contratante: ${data.project.contractor}`);
    doc.text(`Responsável Técnico: ${data.project.technicalManager}`);
    doc.moveDown(1.5);

    // Informações do Ambiente
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text("Dados do Ambiente");
    doc.fillColor("#000000").moveDown(0.5);
    doc.fontSize(10).font("Helvetica");
    doc.text(`Ambiente: ${data.environment.name}`);
    doc.text(`Caixilho: ${data.environment.caixilhoCode} - ${data.environment.caixilhoType}`);
    doc.text(`Quantidade: ${data.environment.quantity} peça(s)`);
    
    if (data.environment.startDate) {
      doc.text(`Data de Liberação: ${format(data.environment.startDate, "dd/MM/yyyy")}`);
    }
    if (data.environment.endDate) {
      doc.text(`Data de Finalização: ${format(data.environment.endDate, "dd/MM/yyyy")}`);
    }
    doc.moveDown(1.5);

    // Evolução da Instalação
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text("Evolução da Instalação");
    doc.fillColor("#000000").moveDown(0.5);
    
    data.installationSteps.forEach((step) => {
      const status = step.isCompleted === 1 ? "✓" : "○";
      const statusColor = step.isCompleted === 1 ? "#22c55e" : "#9ca3af";
      
      doc.fontSize(10).fillColor(statusColor).font("Helvetica-Bold").text(status, { continued: true });
      doc.fillColor("#000000").font("Helvetica").text(` ${step.stepName}`, { continued: true });
      
      if (step.completedAt) {
        doc.fillColor("#6b7280").text(` - Concluído em ${format(step.completedAt, "dd/MM/yyyy")}`);
      } else {
        doc.text("");
      }
    });
    doc.moveDown(1.5);

    // Fotos e Vídeos
    if (data.media.length > 0) {
      doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text("Fotos e Vídeos");
      doc.fillColor("#000000").moveDown(0.5);
      
      const photos = data.media.filter(m => m.mediaType === "photo");
      const videos = data.media.filter(m => m.mediaType === "video");
      
      doc.fontSize(10).font("Helvetica");
      doc.text(`Total de fotos: ${photos.length}`);
      doc.text(`Total de vídeos: ${videos.length}`);
      doc.moveDown(0.5);

      // Adicionar thumbnails de fotos (máximo 6 por página)
      if (photos.length > 0) {
        doc.fontSize(12).font("Helvetica-Bold").text("Fotos:");
        doc.moveDown(0.5);
        
        const photosPerRow = 2;
        const photoWidth = 200;
        const photoHeight = 150;
        const photoSpacing = 20;
        
        for (let i = 0; i < Math.min(photos.length, 6); i++) {
          const photo = photos[i];
          const row = Math.floor(i / photosPerRow);
          const col = i % photosPerRow;
          const xPos = 50 + col * (photoWidth + photoSpacing);
          const yPos = doc.y + row * (photoHeight + photoSpacing + 30);
          
          // Verificar se precisa de nova página
          if (yPos + photoHeight > doc.page.height - 100) {
            doc.addPage();
          }
          
          try {
            // Tentar baixar e adicionar a foto
            const https = await import("https");
            const photoBuffer = await new Promise<Buffer>((resolve, reject) => {
              https.get(photo.fileUrl, (res) => {
                const chunks: Buffer[] = [];
                res.on("data", (chunk) => chunks.push(chunk));
                res.on("end", () => resolve(Buffer.concat(chunks)));
                res.on("error", reject);
              }).on("error", reject);
            });
            
            doc.image(photoBuffer, xPos, yPos, {
              width: photoWidth,
              height: photoHeight,
              fit: [photoWidth, photoHeight],
              align: "center",
              valign: "center"
            });
            
            // Comentário da foto
            if (photo.comment) {
              doc.fontSize(8).font("Helvetica").fillColor("#6b7280").text(
                photo.comment,
                xPos,
                yPos + photoHeight + 5,
                { width: photoWidth, align: "center" }
              );
            }
          } catch (error) {
            console.error(`Erro ao adicionar foto ${photo.fileName}:`, error);
            // Desenhar placeholder
            doc.rect(xPos, yPos, photoWidth, photoHeight).stroke();
            doc.fontSize(8).text("Foto não disponível", xPos, yPos + photoHeight / 2, {
              width: photoWidth,
              align: "center"
            });
          }
        }
        
        doc.moveDown(Math.ceil(Math.min(photos.length, 6) / photosPerRow) * 2 + 1);
      }

      // Listar vídeos
      if (videos.length > 0) {
        if (doc.y > 600) {
          doc.addPage();
        }
        
        doc.fontSize(12).font("Helvetica-Bold").fillColor("#000000").text("Vídeos:");
        doc.moveDown(0.5);
        doc.fontSize(9).font("Helvetica");
        
        videos.forEach((video, index) => {
          doc.text(`${index + 1}. ${video.fileName}`);
          if (video.comment) {
            doc.fontSize(8).fillColor("#6b7280").text(`   ${video.comment}`);
            doc.fontSize(9).fillColor("#000000");
          }
        });
        
        doc.moveDown(1);
      }
    }

    // Nova página para o termo
    doc.addPage();

    // Termo de Entrega
    doc.fontSize(14).font("Helvetica-Bold").fillColor("#1e40af").text("TERMO DE ENTREGA");
    doc.fillColor("#000000").moveDown(1);
    
    doc.fontSize(10).font("Helvetica").text(
      `Declaro que recebi a instalação do caixilho no ambiente "${data.environment.name}" em perfeitas condições de funcionamento, com todos os acabamentos concluídos conforme especificado no projeto. A instalação foi realizada pela empresa ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.`,
      { align: "justify", indent: 20 }
    );
    doc.moveDown(2);

    // Data de entrega
    doc.fontSize(10).font("Helvetica");
    const deliveryDate = data.environment.endDate || new Date();
    doc.text(
      `Data de Entrega: ${format(deliveryDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`,
      { align: "center" }
    );
    doc.moveDown(3);

    // Assinatura
    if (data.deliveryTerm.signature) {
      try {
        const sigData = data.deliveryTerm.signature.split(',')[1];
        if (sigData) {
          const sigBuffer = Buffer.from(sigData, 'base64');
          const signatureWidth = 300;
          const signatureHeight = 100;
          const xPos = (doc.page.width - signatureWidth) / 2;
          
          doc.image(sigBuffer, xPos, doc.y, {
            width: signatureWidth,
            height: signatureHeight,
            fit: [signatureWidth, signatureHeight]
          });
          
          // Linha para assinatura
          doc.strokeColor("#000000").lineWidth(1)
            .moveTo(xPos, doc.y + signatureHeight)
            .lineTo(xPos + signatureWidth, doc.y + signatureHeight)
            .stroke();
          
          doc.moveDown(7);
          
          // Nome do responsável
          doc.fontSize(10).font("Helvetica-Bold").fillColor("#000000").text(
            data.deliveryTerm.responsibleName,
            { align: "center" }
          );
          doc.fontSize(9).font("Helvetica").text(
            "Responsável pelo Recebimento",
            { align: "center" }
          );
        }
      } catch (error) {
        console.error("Erro ao adicionar assinatura:", error);
      }
    }

    // Footer
    doc.fontSize(8).font("Helvetica").fillColor("#666666").text(
      `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
      50,
      doc.page.height - 50,
      { align: "center" }
    );

    doc.end();
  });
}
