import PDFDocument from "pdfkit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EnvironmentPDFData {
  environment: {
    id: number;
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
  photos: Array<{
    fileUrl: string;
    fileName: string;
    comment: string | null;
    uploadedAt: Date | null;
  }>;
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
 * Otimizar imagem para PDF
 */
async function optimizeImage(buffer: Buffer): Promise<Buffer> {
  try {
    const sharp = await import("sharp");
    const optimized = await sharp.default(buffer)
      .resize(600, 450, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toBuffer();
    return optimized;
  } catch (error) {
    console.warn("Erro ao otimizar imagem, usando original:", error);
    return buffer;
  }
}

export async function generateEnvironmentPDF(
  data: EnvironmentPDFData
): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
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
          doc.image(logoData, 40, 30, { width: 70 });
        }
      } catch (error) {
        console.error("Erro ao adicionar logo:", error);
      }

      // Header
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("RELATÓRIO FOTOGRÁFICO", { align: "center" });
      doc.fillColor("#000000").moveDown(0.3);
      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .text("ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.", {
          align: "center",
        });
      doc.moveDown(1);

      // Informações da Obra
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Dados da Obra");
      doc.fillColor("#000000").moveDown(0.3);
      doc.fontSize(9).font("Helvetica");
      doc.text(`Obra: ${data.project.name}`);
      doc.text(`Endereço: ${data.project.address}`);
      doc.text(`Contratante: ${data.project.contractor}`);
      doc.text(`Responsável Técnico: ${data.project.technicalManager}`);
      doc.moveDown(0.8);

      // Informações do Ambiente
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Dados do Ambiente");
      doc.fillColor("#000000").moveDown(0.3);
      doc.fontSize(9).font("Helvetica");
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
      doc.moveDown(1);

      // Resumo de Fotos
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fillColor("#1e40af")
        .text("Resumo Fotográfico");
      doc.fillColor("#000000").moveDown(0.3);
      doc.fontSize(9).font("Helvetica");
      doc.text(`Total de fotos: ${data.photos.length}`);
      doc.moveDown(1);

      // Adicionar fotos em grid (3 por linha)
      const photoWidth = 180;
      const photoHeight = 135;
      const spacing = 12;
      const photosPerRow = 3;
      const pageMargin = 40;
      const pageWidth = doc.page.width - pageMargin * 2;
      const totalPhotoWidth = photosPerRow * photoWidth + (photosPerRow - 1) * spacing;
      const startX = pageMargin + (pageWidth - totalPhotoWidth) / 2;

      let photoIndex = 0;
      let rowIndex = 0;
      let pagePhotoCount = 0;
      const photosPerPage = 9; // 3 linhas x 3 fotos

      for (const photo of data.photos) {
        try {
          // Verificar se precisa de nova página
          if (pagePhotoCount > 0 && pagePhotoCount % photosPerPage === 0) {
            doc.addPage();
            
            // Adicionar cabeçalho na nova página
            doc
              .fontSize(10)
              .font("Helvetica-Bold")
              .fillColor("#1e40af")
              .text(`${data.environment.name} - Fotos (continuação)`, {
                align: "center",
              });
            doc.fillColor("#000000").moveDown(0.5);
            
            rowIndex = 0;
          }

          // Calcular posição
          const colIndex = photoIndex % photosPerRow;
          const xPos = startX + colIndex * (photoWidth + spacing);
          const yPos = doc.y + Math.floor(photoIndex / photosPerRow) * (photoHeight + spacing + 40);

          // Baixar e otimizar imagem
          const imageBuffer = await downloadImage(photo.fileUrl);
          if (!imageBuffer) {
            console.warn(`Não foi possível baixar foto: ${photo.fileName}`);
            photoIndex++;
            continue;
          }

          const optimizedBuffer = await optimizeImage(imageBuffer);

          // Adicionar foto
          doc.image(optimizedBuffer, xPos, yPos, {
            width: photoWidth,
            height: photoHeight,
            fit: [photoWidth, photoHeight],
          });

          // Adicionar comentário se existir
          if (photo.comment) {
            doc
              .fontSize(7)
              .font("Helvetica")
              .fillColor("#6b7280")
              .text(photo.comment, xPos, yPos + photoHeight + 2, {
                width: photoWidth,
                align: "center",
                ellipsis: true,
              });
          }

          // Adicionar data da foto
          if (photo.uploadedAt) {
            doc
              .fontSize(6)
              .font("Helvetica")
              .fillColor("#9ca3af")
              .text(format(photo.uploadedAt, "dd/MM/yyyy HH:mm"), xPos, yPos + photoHeight + 18, {
                width: photoWidth,
                align: "center",
              });
          }

          photoIndex++;
          pagePhotoCount++;

          // Verificar se precisa de nova linha
          if ((photoIndex + 1) % photosPerRow === 0) {
            rowIndex++;
          }
        } catch (error) {
          console.error(`Erro ao processar foto ${photo.fileName}:`, error);
          photoIndex++;
          // Continuar com a próxima foto
        }
      }

      // Footer em todas as páginas
      const pageCount = doc.bufferedPageRange().count;
      for (let i = 0; i < pageCount; i++) {
        doc.switchToPage(i);
        doc
          .fontSize(7)
          .font("Helvetica")
          .fillColor("#999999")
          .text(
            `Página ${i + 1} de ${pageCount} | Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}`,
            40,
            doc.page.height - 30,
            { align: "center" }
          );
      }

      doc.end();
    } catch (error) {
      console.error("Erro ao gerar PDF do ambiente:", error);
      reject(error);
    }
  });
}
