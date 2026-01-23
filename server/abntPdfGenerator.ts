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

// Constantes ABNT
const MARGIN_LEFT = 75; // 3cm
const MARGIN_RIGHT = 50; // 2cm
const MARGIN_TOP = 50; // 2cm
const MARGIN_BOTTOM = 50; // 2cm
const FONT_SIZE = 12;
const FONT_SIZE_TITLE = 14;
const FONT_SIZE_SUBTITLE = 12;
const LINE_HEIGHT = 1.5;

function getStatusLabel(status: string): string {
  const statusMap: { [key: string]: string } = {
    "pending": "Pendente",
    "in-progress": "Em Andamento",
    "completed": "Concluído",
    "cancelled": "Cancelado",
  };
  return statusMap[status] || status;
}

export async function generateABNTPDF(data: InspectionData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: MARGIN_TOP,
        bottom: MARGIN_BOTTOM,
        left: MARGIN_LEFT,
        right: MARGIN_RIGHT,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // Configurar fonte padrão
    doc.font("Helvetica");

    // ===== CAPA =====
    await generateCapa(doc, data);

    // ===== FOLHA DE ROSTO =====
    doc.addPage();
    await generateFolhaDeRosto(doc, data);

    // ===== SUMÁRIO =====
    doc.addPage();
    generateSumario(doc, data);

    // ===== INTRODUÇÃO =====
    doc.addPage();
    generateIntroducao(doc, data);

    // ===== DESENVOLVIMENTO =====
    doc.addPage();
    await generateDesenvolvimento(doc, data);

    // ===== CONCLUSÃO =====
    doc.addPage();
    generateConclusao(doc, data);

    // ===== REFERÊNCIAS =====
    doc.addPage();
    generateReferencias(doc);

    // ===== APÊNDICES (FOTOS) =====
    if (data.items.some((item) => item.photos.length > 0)) {
      doc.addPage();
      await generateApendicesFotos(doc, data);
    }

    doc.end();
  });
}

async function generateCapa(
  doc: PDFKit.PDFDocument,
  data: InspectionData
): Promise<void> {
  const pageHeight = doc.page.height;
  const centerX = doc.page.width / 2;

  // Logo
  try {
    const fs = await import("fs");
    const logoPath = "/home/ubuntu/romaneio_dubai_lm/client/public/aluminc-logo.png";
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      doc.image(logoData, centerX - 40, 100, { width: 80 });
    }
  } catch (error) {
    console.error("Erro ao adicionar logo:", error);
  }

  // Espaço
  doc.y = 220;

  // Título principal
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .text("ROMANEIO DE LIBERAÇÃO DE AMBIENTES", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1);

  // Subtítulo
  doc
    .font("Helvetica")
    .fontSize(12)
    .text("Relatório Técnico de Inspeção", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(2);

  // Informações da obra
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .text("DUBAI LM EMPREENDIMENTOS IMOBILIÁRIOS SPE LTDA", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(0.5);

  doc
    .font("Helvetica")
    .fontSize(11)
    .text("Avenida Lucianinho Melli, nº 444 – Vila Osasco – Osasco/SP", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  // Espaço
  doc.moveDown(3);

  // Fornecedor
  doc
    .font("Helvetica")
    .fontSize(11)
    .text("Fornecedor / Instalador: ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda.", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(3);

  // Data
  const dataFormatada = format(data.createdAt, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  doc
    .font("Helvetica")
    .fontSize(12)
    .text(dataFormatada, {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });
}

async function generateFolhaDeRosto(
  doc: PDFKit.PDFDocument,
  data: InspectionData
): Promise<void> {
  // Título
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("FOLHA DE ROSTO", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(2);

  // Informações do documento
  doc.font("Helvetica").fontSize(12);

  doc.text("Título: Romaneio de Liberação de Ambientes");
  doc.moveDown(0.5);

  doc.text("Tipo: Relatório Técnico de Inspeção");
  doc.moveDown(0.5);

  doc.text(
    `Data: ${format(data.createdAt, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`
  );
  doc.moveDown(0.5);

  doc.text(`Status: ${getStatusLabel(data.status)}`);
  doc.moveDown(0.5);

  doc.text(`Obra: ${data.title}`);
  doc.moveDown(0.5);

  doc.text(`Total de Ambientes: ${data.items.length}`);
  doc.moveDown(2);

  // Responsáveis
  doc.font("Helvetica-Bold").fontSize(12).text("Responsáveis:");
  doc.font("Helvetica").fontSize(11);
  doc.moveDown(0.5);

  doc.text("Responsável Técnico da Obra: Eng. William");
  doc.moveDown(0.5);

  doc.text("Fornecedor: ALUMINC Esquadrias Metálicas");
  doc.moveDown(2);

  // Resumo
  doc.font("Helvetica-Bold").fontSize(12).text("Resumo:");
  doc.font("Helvetica").fontSize(11);
  doc.moveDown(0.5);

  const resumo = `Este relatório apresenta os resultados da inspeção técnica dos ambientes da obra ${data.title}, realizada pela ALUMINC Esquadrias Metálicas. O documento contém informações detalhadas sobre o status de instalação, acabamento e finalização de cada ambiente, incluindo fotografias e observações técnicas.`;

  doc.text(resumo, {
    width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    align: "justify",
  });
}

function generateSumario(doc: PDFKit.PDFDocument, data: InspectionData): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("SUMÁRIO", {
      align: "center",
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1.5);

  doc.font("Helvetica").fontSize(12);

  const sumarioItems = [
    "1 INTRODUÇÃO",
    "2 DESENVOLVIMENTO",
    ...data.items.map((_, index) => `2.${index + 1} ${data.items[index].environmentName}`),
    "3 CONCLUSÃO",
    "4 REFERÊNCIAS",
    "APÊNDICE A – FOTOGRAFIAS",
  ];

  sumarioItems.forEach((item) => {
    doc.text(item);
    doc.moveDown(0.5);
  });
}

function generateIntroducao(doc: PDFKit.PDFDocument, data: InspectionData): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("1 INTRODUÇÃO", {
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1);

  doc.font("Helvetica").fontSize(12);

  const introducao = `Este relatório apresenta os resultados da inspeção técnica realizada na obra ${data.title}, localizada na Avenida Lucianinho Melli, nº 444, Vila Osasco, Osasco/SP.

A inspeção foi conduzida pela ALUMINC Esquadrias Metálicas Indústria e Comércio Ltda., com o objetivo de avaliar o status de instalação e acabamento dos caixilhos em cada ambiente.

O presente documento está estruturado de acordo com as normas técnicas ABNT e contém informações detalhadas sobre:

a) Status de instalação de cada ambiente;
b) Observações técnicas e pendências;
c) Responsáveis pela obra e fornecedor;
d) Fotografias dos ambientes inspecionados;
e) Assinaturas dos responsáveis.`;

  doc.text(introducao, {
    width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    align: "justify",
  });
}

async function generateDesenvolvimento(
  doc: PDFKit.PDFDocument,
  data: InspectionData
): Promise<void> {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("2 DESENVOLVIMENTO", {
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1);

  for (let index = 0; index < data.items.length; index++) {
    const item = data.items[index];

    // Verificar se precisa de nova página
    if (doc.y > 650) {
      doc.addPage();
    }

    // Título do ambiente
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(`2.${index + 1} ${item.environmentName}`, {
        width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
      });

    doc.moveDown(0.5);

    // Informações do caixilho
    doc.font("Helvetica").fontSize(11);

    doc.text(`Caixilho: ${item.caixilhoCode}`);
    doc.moveDown(0.3);

    doc.text(`Tipo: ${item.caixilhoType}`);
    doc.moveDown(0.3);

    doc.text(`Quantidade: ${item.quantity} peça(s)`);
    doc.moveDown(0.5);

    // Data de liberação
    if (item.releaseDate) {
      const dataLiberacao = format(item.releaseDate, "dd/MM/yyyy");
      doc.text(`Data de Liberação: ${dataLiberacao}`);
      doc.moveDown(0.3);
    }

    // Responsáveis
    if (item.responsibleConstruction) {
      doc.text(`Responsável da Obra: ${item.responsibleConstruction}`);
      doc.moveDown(0.3);
    }

    if (item.responsibleSupplier) {
      doc.text(`Responsável do Fornecedor: ${item.responsibleSupplier}`);
      doc.moveDown(0.3);
    }

    // Observações
    if (item.observations) {
      doc.font("Helvetica-Bold").text("Observações:");
      doc.font("Helvetica").text(item.observations, {
        width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
        align: "justify",
      });
      doc.moveDown(0.5);
    }

    // Mídias
    if (item.photos.length > 0 || item.videos.length > 0) {
      doc
        .font("Helvetica-Bold")
        .text(`Mídias Anexadas: ${item.photos.length} foto(s), ${item.videos.length} vídeo(s)`);
      doc.moveDown(0.5);

      // Renderizar fotos
      if (item.photos.length > 0) {
        doc.font("Helvetica").fontSize(10).text("Fotografias:");
        doc.moveDown(0.3);

        const photoWidth = 60;
        const photoHeight = 45;
        let x = MARGIN_LEFT;
        let y = doc.y;

        for (const photo of item.photos) {
          try {
            const axios = await import("axios");
            const response = await axios.default.get(photo.fileUrl, {
              responseType: "arraybuffer",
              timeout: 10000,
            });
            const buffer = response.data;

            if (x + photoWidth + 10 > doc.page.width - MARGIN_RIGHT) {
              x = MARGIN_LEFT;
              y += photoHeight + 15;
            }

            if (y + photoHeight + 20 > doc.page.height - MARGIN_BOTTOM) {
              doc.addPage();
              x = MARGIN_LEFT;
              y = MARGIN_TOP;
            }

            doc.image(buffer, x, y, { width: photoWidth, height: photoHeight });
            doc.fontSize(8).text(photo.identifier, x, y + photoHeight + 2, {
              width: photoWidth,
              align: "center",
            });

            x += photoWidth + 10;
          } catch (error) {
            console.error(`Erro ao carregar foto ${photo.fileName}:`, error);
          }
        }

        doc.y = y + photoHeight + 20;
      }
    }

    doc.moveDown(1);

    // Linha separadora
    if (index < data.items.length - 1) {
      doc.strokeColor("#cccccc").lineWidth(1).moveTo(MARGIN_LEFT, doc.y).lineTo(doc.page.width - MARGIN_RIGHT, doc.y).stroke();
      doc.moveDown(0.5);
    }
  }
}

function generateConclusao(doc: PDFKit.PDFDocument, data: InspectionData): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("3 CONCLUSÃO", {
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1);

  doc.font("Helvetica").fontSize(12);

  const conclusao = `A inspeção técnica realizada na obra ${data.title} foi concluída conforme programado. Os ambientes foram avaliados quanto ao status de instalação e acabamento dos caixilhos.

Com base nas observações técnicas registradas neste relatório, recomenda-se:

a) Análise detalhada de cada pendência identificada;
b) Execução das correções necessárias conforme cronograma;
c) Realização de inspeção de acompanhamento após conclusão das correções;
d) Documentação fotográfica das correções realizadas.

Este relatório foi elaborado de acordo com as normas técnicas ABNT e reflete o estado atual da obra na data de inspeção.`;

  doc.text(conclusao, {
    width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    align: "justify",
  });
}

function generateReferencias(doc: PDFKit.PDFDocument): void {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("4 REFERÊNCIAS", {
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1);

  doc.font("Helvetica").fontSize(12);

  const referencias = [
    "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 6023: Informação e documentação – Referências – Elaboração. Rio de Janeiro, 2018.",
    "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 14724: Informação e documentação – Trabalhos acadêmicos – Apresentação. Rio de Janeiro, 2011.",
    "ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. NBR 10520: Informação e documentação – Citações em documentos – Apresentação. Rio de Janeiro, 2023.",
  ];

  referencias.forEach((ref, index) => {
    doc.text(`${index + 1}. ${ref}`, {
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
      align: "justify",
    });
    doc.moveDown(0.5);
  });
}

async function generateApendicesFotos(
  doc: PDFKit.PDFDocument,
  data: InspectionData
): Promise<void> {
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .text("APÊNDICE A – FOTOGRAFIAS", {
      width: doc.page.width - MARGIN_LEFT - MARGIN_RIGHT,
    });

  doc.moveDown(1);

  doc.font("Helvetica").fontSize(11);

  for (const item of data.items) {
    if (item.photos.length > 0) {
      doc.font("Helvetica-Bold").fontSize(12).text(`${item.environmentName}`);
      doc.moveDown(0.5);

      const photoWidth = 100;
      const photoHeight = 75;
      let x = MARGIN_LEFT;
      let y = doc.y;

      for (const photo of item.photos) {
        try {
          const axios = await import("axios");
          const response = await axios.default.get(photo.fileUrl, {
            responseType: "arraybuffer",
            timeout: 10000,
          });
          const buffer = response.data;

          if (x + photoWidth + 10 > doc.page.width - MARGIN_RIGHT) {
            x = MARGIN_LEFT;
            y += photoHeight + 20;
          }

          if (y + photoHeight + 30 > doc.page.height - MARGIN_BOTTOM) {
            doc.addPage();
            x = MARGIN_LEFT;
            y = MARGIN_TOP;
          }

          doc.image(buffer, x, y, { width: photoWidth, height: photoHeight });
          doc.fontSize(9).text(photo.identifier, x, y + photoHeight + 2, {
            width: photoWidth,
            align: "center",
          });

          x += photoWidth + 10;
        } catch (error) {
          console.error(`Erro ao carregar foto ${photo.fileName}:`, error);
        }
      }

      doc.y = y + photoHeight + 25;
      doc.moveDown(1);
    }
  }
}
