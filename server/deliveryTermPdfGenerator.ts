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

/**
 * Baixar imagem de uma URL
 */
async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const https = await import("https");
    return new Promise((resolve, reject) => {
      https
        .get(url, (res) => {
          const chunks: Buffer[] = [];
          res.on("data", (chunk) => chunks.push(chunk));
          res.on("end", () => resolve(Buffer.concat(chunks)));
          res.on("error", reject);
        })
        .on("error", reject);
    });
  } catch (error) {
    console.error(`Erro ao baixar imagem de ${url}:`, error);
    return null;
  }
}

/**
 * Redimensionar imagem para otimizar tamanho do PDF
 */
async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    // Usar sharp para otimizar imagem
    const sharp = await import("sharp");
    const optimized = await sharp.default(buffer)
      .resize(800, 600, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    return optimized;
  } catch (error) {
    console.warn("Erro ao otimizar imagem, usando original:", error);
    return buffer;
  }
}

export async function generateDeliveryTermPDF(
  data: DeliveryTermData
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
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
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("TERMO DE ENTREGA DE INSTALAÇÃO", { align: "center" });
      doc.fillColor("#000000").moveDown(0.5);
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.", {
          align: "center",
        });
      doc.moveDown(1.5);

      // Informações da Obra
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Dados da Obra");
      doc.fillColor("#000000").moveDown(0.5);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Obra: ${data.project.name}`);
      doc.text(`Endereço: ${data.project.address}`);
      doc.text(`Contratante: ${data.project.contractor}`);
      doc.text(`Responsável Técnico: ${data.project.technicalManager}`);
      doc.moveDown(1.5);

      // Informações do Ambiente
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Dados do Ambiente");
      doc.fillColor("#000000").moveDown(0.5);
      doc.fontSize(10).font("Helvetica");
      doc.text(`Ambiente: ${data.environment.name}`);
      doc.text(
        `Caixilho: ${data.environment.caixilhoCode} - ${data.environment.caixilhoType}`
      );
      doc.text(`Quantidade: ${data.environment.quantity} peça(s)`);

      if (data.environment.startDate) {
        doc.text(
          `Data de Liberação: ${format(data.environment.startDate, "dd/MM/yyyy")}`
        );
      }
      if (data.environment.endDate) {
        doc.text(
          `Data de Finalização: ${format(data.environment.endDate, "dd/MM/yyyy")}`
        );
      }
      doc.moveDown(1.5);

      // Evolução da Instalação
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Evolução da Instalação");
      doc.fillColor("#000000").moveDown(0.5);

      data.installationSteps.forEach((step) => {
        const status = step.isCompleted === 1 ? "✓" : "○";
        const statusColor = step.isCompleted === 1 ? "#22c55e" : "#9ca3af";

        doc
          .fontSize(10)
          .fillColor(statusColor)
          .font("Helvetica-Bold")
          .text(status, { continued: true });
        doc
          .fillColor("#000000")
          .font("Helvetica")
          .text(` ${step.stepName}`, { continued: true });

        if (step.completedAt) {
          doc
            .fillColor("#6b7280")
            .text(
              ` - Concluído em ${format(step.completedAt, "dd/MM/yyyy")}`
            );
        } else {
          doc.text("");
        }
      });
      doc.moveDown(1.5);

      // Fotos e Vídeos
      if (data.media && data.media.length > 0) {
        const photos = data.media.filter((m) => m.mediaType === "photo");
        const videos = data.media.filter((m) => m.mediaType === "video");

        // Seção de Fotos
        if (photos.length > 0) {
          // Verificar se precisa de nova página
          if (doc.y > 500) {
            doc.addPage();
          }

          doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .fillColor("#1e40af")
            .text("Fotos da Instalação");
          doc.fillColor("#000000").moveDown(0.5);
          doc.fontSize(10).font("Helvetica");
          doc.text(`Total de fotos: ${photos.length}`);
          doc.moveDown(0.5);

          // Adicionar fotos (2 por linha)
          const photoWidth = 250;
          const photoHeight = 180;
          const spacing = 15;
          let photoCount = 0;
          let xPosition = 50;
          let yPosition = doc.y;

          for (const photo of photos) {
            try {
              // Baixar imagem
              const imageBuffer = await downloadImage(photo.fileUrl);
              if (!imageBuffer) {
                console.warn(`Não foi possível baixar foto: ${photo.fileName}`);
                continue;
              }

              // Otimizar imagem
              const optimizedBuffer = await optimizeImage(imageBuffer);

              // Verificar se precisa de nova linha
              if (photoCount > 0 && photoCount % 2 === 0) {
                yPosition += photoHeight + 40;
                xPosition = 50;

                // Verificar se precisa de nova página
                if (yPosition + photoHeight > doc.page.height - 100) {
                  doc.addPage();
                  yPosition = 50;
                }
              }

              // Adicionar foto
              doc.image(optimizedBuffer, xPosition, yPosition, {
                width: photoWidth,
                height: photoHeight,
                fit: [photoWidth, photoHeight],
              });

              // Adicionar comentário se existir
              if (photo.comment) {
                doc
                  .fontSize(8)
                  .font("Helvetica")
                  .fillColor("#6b7280")
                  .text(photo.comment, xPosition, yPosition + photoHeight + 5, {
                    width: photoWidth,
                    align: "center",
                  });
              }

              xPosition += photoWidth + spacing;
              photoCount++;
            } catch (error) {
              console.error(`Erro ao processar foto ${photo.fileName}:`, error);
              // Continuar com a próxima foto
            }
          }

          doc.moveDown(2);
        }

        // Seção de Vídeos
        if (videos.length > 0) {
          if (doc.y > 600) {
            doc.addPage();
          }

          doc
            .fontSize(14)
            .font("Helvetica-Bold")
            .fillColor("#1e40af")
            .text("Vídeos da Instalação");
          doc.fillColor("#000000").moveDown(0.5);
          doc.fontSize(10).font("Helvetica");
          doc.text(`Total de vídeos: ${videos.length}`);
          doc.moveDown(0.5);

          videos.forEach((video, index) => {
            doc.fontSize(9).font("Helvetica");
            doc.text(`${index + 1}. ${video.fileName}`);
            if (video.comment) {
              doc
                .fontSize(8)
                .fillColor("#6b7280")
                .text(`   ${video.comment}`);
              doc.fillColor("#000000");
            }
          });

          doc.moveDown(1.5);
        }
      }

      // Nova página para o termo
      doc.addPage();

      // Termo de Entrega
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("TERMO DE ENTREGA");
      doc.fillColor("#000000").moveDown(1);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Declaro que recebi a instalação do caixilho no ambiente "${data.environment.name}" em perfeitas condições de funcionamento, com todos os acabamentos concluídos conforme especificado no projeto. A instalação foi realizada pela empresa ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.`,
          { align: "justify", indent: 20 }
        );
      doc.moveDown(2);

      // Data de entrega
      doc.fontSize(10).font("Helvetica");
      const deliveryDate = data.environment.endDate || new Date();
      doc.text(
        `Data de Entrega: ${format(deliveryDate, "dd 'de' MMMM 'de' yyyy", {
          locale: ptBR,
        })}`,
        { align: "center" }
      );
      doc.moveDown(3);

      // Assinatura
      if (data.deliveryTerm.signature) {
        try {
          const sigData = data.deliveryTerm.signature.split(",")[1];
          if (sigData) {
            const sigBuffer = Buffer.from(sigData, "base64");
            const signatureWidth = 300;
            const signatureHeight = 100;
            const xPos = (doc.page.width - signatureWidth) / 2;

            doc.image(sigBuffer, xPos, doc.y, {
              width: signatureWidth,
              height: signatureHeight,
              fit: [signatureWidth, signatureHeight],
            });

            // Linha para assinatura
            doc
              .strokeColor("#000000")
              .lineWidth(1)
              .moveTo(xPos, doc.y + signatureHeight)
              .lineTo(xPos + signatureWidth, doc.y + signatureHeight)
              .stroke();

            doc.moveDown(7);

            // Nome do responsável
            doc
              .fontSize(10)
              .font("Helvetica-Bold")
              .fillColor("#000000")
              .text(data.deliveryTerm.responsibleName, { align: "center" });
            doc
              .fontSize(9)
              .font("Helvetica")
              .text("Responsável pelo Recebimento", { align: "center" });
          }
        } catch (error) {
          console.error("Erro ao adicionar assinatura:", error);
        }
      }

      // Footer
      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor("#666666")
        .text(
          `Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
          50,
          doc.page.height - 50,
          { align: "center" }
        );

      doc.end();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      reject(error);
    }
  });
}
