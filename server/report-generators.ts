import { PDFDocument, rgb, PDFPage } from "pdf-lib";
import * as db from "./db";

/**
 * Gera Relatório Técnico com dados da obra, comentários e fotos em grid 2x2
 */
export async function generateTechnicalReportPDF(
  inspectionEnvironmentId: number
): Promise<Buffer> {
  const inspectionEnv = await db.getInspectionEnvironmentById(
    inspectionEnvironmentId
  );
  if (!inspectionEnv) throw new Error("Ambiente não encontrado");

  const inspection = await db.getInspectionById(inspectionEnv.inspectionId);
  if (!inspection) throw new Error("Inspeção não encontrada");

  const project = await db.getProjectById(inspection.projectId);
  if (!project) throw new Error("Projeto não encontrado");

  const inspectionItem = await db.getInspectionItemByEnvironmentId(
    inspectionEnvironmentId
  );

  const mediaFiles = inspectionItem
    ? await db.getMediaFilesByItem(inspectionItem.id)
    : [];

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  let yPosition = height - 40;
  const margin = 40;
  const pageWidth = width - 2 * margin;

  function addText(
    text: string,
    fontSize: number = 11,
    bold: boolean = false,
    color = rgb(0, 0, 0)
  ) {
    if (yPosition < margin + 100) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }

    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color,
      maxWidth: pageWidth,
      wordBreaks: [" ", "-"],
    });

    yPosition -= fontSize + 8;
  }

  function addLine() {
    if (yPosition < margin + 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;
  }

  // Cabeçalho
  const dataRelatorio = new Date().toLocaleDateString("pt-BR");
  addText(`Relatório ${dataRelatorio} nº ${inspection.id}`, 12, true, rgb(31, 41, 55));
  yPosition -= 5;

  // Logo e título
  addText("ALUMINC", 14, true, rgb(31, 41, 55));
  addText("RELATÓRIO ALUMINC – DEPARTAMENTO TÉCNICO / OBRAS", 11, true);
  yPosition -= 10;

  // Tabela de informações
  addText("Obra", 10, true);
  addText(project.name || "N/A", 10);
  yPosition -= 5;

  addText("Local", 10, true);
  addText(project.address || "N/A", 10);
  yPosition -= 5;

  addText("Contratante", 10, true);
  addText(project.contractor || "N/A", 10);
  yPosition -= 5;

  addText("Responsável", 10, true);
  addText(project.technicalManager || "N/A", 10);
  yPosition -= 15;

  addLine();

  // Comentários
  if (inspectionItem?.observations) {
    addText("COMENTÁRIOS", 11, true, rgb(31, 41, 55));
    addText(inspectionItem.observations, 10);
    yPosition -= 15;
  }

  // Fotos em grid 2x2
  if (mediaFiles.length > 0) {
    addLine();
    addText(`FOTOS (${mediaFiles.length})`, 11, true, rgb(31, 41, 55));
    yPosition -= 20;

    let photosPerPage = 0;
    for (let i = 0; i < mediaFiles.length; i++) {
      if (photosPerPage === 4) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = height - 40;
        photosPerPage = 0;
      }

      const media = mediaFiles[i];
      addText(`${i + 1}. ${media.fileName}`, 9);
      if (media.comment) {
        addText(`   ${media.comment}`, 8);
      }
      yPosition -= 5;
      photosPerPage++;
    }
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Gera Galeria de Fotos com 1 foto por página
 */
export async function generatePhotoGalleryPDF(
  inspectionEnvironmentId: number
): Promise<Buffer> {
  const inspectionEnv = await db.getInspectionEnvironmentById(
    inspectionEnvironmentId
  );
  if (!inspectionEnv) throw new Error("Ambiente não encontrado");

  const inspection = await db.getInspectionById(inspectionEnv.inspectionId);
  if (!inspection) throw new Error("Inspeção não encontrada");

  const inspectionItem = await db.getInspectionItemByEnvironmentId(
    inspectionEnvironmentId
  );

  const mediaFiles = inspectionItem
    ? await db.getMediaFilesByItem(inspectionItem.id)
    : [];

  const pdfDoc = await PDFDocument.create();
  const width = 595;
  const height = 842;

  // Página de capa
  let page = pdfDoc.addPage([595, 842]);
  const margin = 40;

  page.drawText("Galeria de Fotos", {
    x: margin,
    y: height - 100,
    size: 24,
    color: rgb(31, 41, 55),
  });

  page.drawText(`Ambiente: ${inspectionEnv.name}`, {
    x: margin,
    y: height - 150,
    size: 12,
  });

  page.drawText(`Data: ${new Date().toLocaleDateString("pt-BR")}`, {
    x: margin,
    y: height - 180,
    size: 12,
  });

  page.drawText(`Total de Fotos: ${mediaFiles.length}`, {
    x: margin,
    y: height - 210,
    size: 12,
  });

  // Páginas de fotos
  for (let i = 0; i < mediaFiles.length; i++) {
    page = pdfDoc.addPage([595, 842]);
    const media = mediaFiles[i];

    // Número da foto
    page.drawText(`${i + 1}`, {
      x: margin,
      y: height - 50,
      size: 14,
      color: rgb(31, 41, 55),
    });

    // Descrição
    page.drawText(media.fileName, {
      x: margin,
      y: height - 80,
      size: 11,
    });

    if (media.comment) {
      page.drawText(`Observação: ${media.comment}`, {
        x: margin,
        y: height - 110,
        size: 10,
      });
    }

    // Rodapé
    page.drawText(`Página ${i + 2} de ${mediaFiles.length + 1}`, {
      x: width - margin - 100,
      y: margin,
      size: 9,
      color: rgb(128, 128, 128),
    });
  }

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

/**
 * Gera Termo de Entrega com campos de assinatura
 */
export async function generateDeliveryTermPDF(
  inspectionEnvironmentId: number
): Promise<Buffer> {
  const inspectionEnv = await db.getInspectionEnvironmentById(
    inspectionEnvironmentId
  );
  if (!inspectionEnv) throw new Error("Ambiente não encontrado");

  const inspection = await db.getInspectionById(inspectionEnv.inspectionId);
  if (!inspection) throw new Error("Inspeção não encontrada");

  const project = await db.getProjectById(inspection.projectId);
  if (!project) throw new Error("Projeto não encontrado");

  const inspectionItem = await db.getInspectionItemByEnvironmentId(
    inspectionEnvironmentId
  );

  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  let yPosition = height - 40;
  const margin = 40;
  const pageWidth = width - 2 * margin;

  function addText(
    text: string,
    fontSize: number = 11,
    bold: boolean = false,
    color = rgb(0, 0, 0)
  ) {
    if (yPosition < margin + 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }

    page.drawText(text, {
      x: margin,
      y: yPosition,
      size: fontSize,
      color,
      maxWidth: pageWidth,
      wordBreaks: [" ", "-"],
    });

    yPosition -= fontSize + 6;
  }

  function addLine() {
    if (yPosition < margin + 50) {
      page = pdfDoc.addPage([595, 842]);
      yPosition = height - 40;
    }
    page.drawLine({
      start: { x: margin, y: yPosition },
      end: { x: width - margin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 10;
  }

  // Cabeçalho
  addText("TERMO DE ENTREGA DE CAIXILHOS DE ALUMÍNIO – ALUMINC", 14, true, rgb(31, 41, 55));
  yPosition -= 5;

  // Empresa Executora
  addText("Empresa Executora:", 11, true);
  addText("ALUMINC Esquadrias Metálicas Ltda.", 11);
  addText("CNPJ: ______________________________", 11);
  addText("Endereço: ___________________________", 11);
  addText("Responsável Técnico: __________________", 11);
  yPosition -= 10;

  addLine();

  // Dados do Cliente / Obra
  addText("DADOS DO CLIENTE / OBRA", 11, true, rgb(31, 41, 55));
  addText("Contratante: ___________________________________________", 11);
  addText("CNPJ/CPF: _____________________________________________", 11);
  addText("Empreendimento / Obra: _________________________________", 11);
  addText(`Endereço da Obra: ${project.address || "____________________________"}`, 11);
  addText(`Ambiente: ${inspectionEnv.name}`, 11);
  addText("Contrato nº: _______________________", 11);
  yPosition -= 10;

  addLine();

  // Declaração de Entrega
  addText("DECLARAÇÃO DE ENTREGA", 11, true, rgb(31, 41, 55));
  const declaracao = `Declaro que recebi a instalação do(s) caixilho(s) de alumínio no ambiente, em perfeitas condições de funcionamento, com todos os acabamentos concluídos, conforme especificado em projeto, memoriais e contrato.

A instalação foi realizada pela empresa ALUMINC Esquadrias Metálicas Ltda., atendendo aos padrões técnicos, de qualidade e segurança aplicáveis.

No ato da entrega, o(s) caixilho(s) foi(foram) vistoriado(s), encontrando-se em conformidade, não havendo ressalvas quanto à execução, salvo observações abaixo (se houver).`;

  addText(declaracao, 10);
  yPosition -= 10;

  // Observações
  if (inspectionItem?.observations) {
    addText("OBSERVAÇÕES:", 11, true);
    addText(inspectionItem.observations, 10);
    yPosition -= 10;
  }

  addLine();

  // Responsável pelo Recebimento
  addText("RESPONSÁVEL PELO RECEBIMENTO", 11, true, rgb(31, 41, 55));
  addText("Nome do Responsável: ________________________________________", 11);
  addText("Função: _________________________________________________", 11);
  addText("Documento (CPF/RG): _____________________________________", 11);
  yPosition -= 20;
  addText("Assinatura: ______________________________________________", 11);
  yPosition -= 5;
  addText("Data: ____ / ____ / ______", 11);
  yPosition -= 15;

  addLine();

  // Responsável pela Entrega – ALUMINC
  addText("RESPONSÁVEL PELA ENTREGA – ALUMINC", 11, true, rgb(31, 41, 55));
  addText("Nome: _________________________________________________", 11);
  addText("Função: ________________________________________________", 11);
  yPosition -= 20;
  addText("Assinatura: _____________________________________________", 11);
  yPosition -= 5;
  addText("Data: ____ / ____ / ______", 11);

  // Data de emissão
  yPosition -= 20;
  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  addText(`Data de Emissão: ${dataEmissao}`, 11, true);

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
