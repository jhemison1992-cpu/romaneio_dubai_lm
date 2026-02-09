import { PDFDocument, PDFPage, rgb } from "pdf-lib";
import * as db from "./db";

/**
 * Gera PDF do termo de entrega com todas as informações do ambiente
 */
export async function generateDeliveryReportPDF(
  inspectionEnvironmentId: number
): Promise<Buffer> {
  // Buscar dados do ambiente de inspeção
  const inspectionEnv = await db.getInspectionEnvironmentById(
    inspectionEnvironmentId
  );

  if (!inspectionEnv) {
    throw new Error("Ambiente de inspeção não encontrado");
  }

  // Buscar dados da inspeção
  const inspection = await db.getInspectionById(inspectionEnv.inspectionId);
  if (!inspection) {
    throw new Error("Inspeção não encontrada");
  }

  // Buscar dados do projeto
  const project = await db.getProjectById(inspection.projectId);
  if (!project) {
    throw new Error("Projeto não encontrado");
  }

  // Buscar item de inspeção
  const inspectionItem = await db.getInspectionItemByEnvironmentId(
    inspectionEnvironmentId
  );

  // Buscar dados das 7 seções
  const laborItems = await db.getLaborItems(inspectionEnvironmentId);
  const equipmentItems = await db.getEquipmentItems(inspectionEnvironmentId);
  const activityItems = await db.getActivityItems(inspectionEnvironmentId);
  const occurrenceItems = await db.getOccurrenceItems(inspectionEnvironmentId);
  const receivedMaterialItems = await db.getReceivedMaterialItems(
    inspectionEnvironmentId
  );
  const usedMaterialItems = await db.getUsedMaterialItems(
    inspectionEnvironmentId
  );
  const commentItems = await db.getCommentItems(inspectionEnvironmentId);

  // Fotos do ambiente estariam aqui, mas mediaFiles está ligado a inspectionItems
  // Implementação de fotos pode ser adicionada depois se necessário

  // Criar documento PDF
  const pdfDoc = await PDFDocument.create();
  let page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  let yPosition = height - 40;
  const margin = 40;
  const pageWidth = width - 2 * margin;

  // Função auxiliar para adicionar texto
  function addText(
    text: string,
    fontSize: number = 12,
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

    yPosition -= fontSize + 8;
  }

  // Cabeçalho
  addText("TERMO DE ENTREGA", 18, true, rgb(31, 41, 55));
  addText("Romaneio ALUMINC", 14, true, rgb(31, 41, 55));
  yPosition -= 10;

  // Informações da obra
  addText("INFORMAÇÕES DA OBRA", 12, true, rgb(31, 41, 55));
  addText(`Obra: ${project.name}`, 11);
  addText(`Endereço: ${project.address || "N/A"}`, 11);
  addText(`Contratante: ${project.contractor || "N/A"}`, 11);
  addText(`Responsável Técnico: ${project.technicalManager || "N/A"}`, 11);
  yPosition -= 10;

  // Informações do ambiente
  addText("INFORMAÇÕES DO AMBIENTE", 12, true, rgb(31, 41, 55));
  addText(`Nome: ${inspectionEnv.name}`, 11);
  addText(`Código: ${inspectionEnv.caixilhoCode || "N/A"}`, 11);
  addText(`Tipo: ${inspectionEnv.caixilhoType || "N/A"}`, 11);
  addText(`Quantidade: ${inspectionEnv.quantity || 1}`, 11);
  if (inspectionEnv.startDate) {
    addText(
      `Data de Início: ${new Date(inspectionEnv.startDate).toLocaleDateString("pt-BR")}`,
      11
    );
  }
  if (inspectionEnv.endDate) {
    addText(
      `Data de Finalização: ${new Date(inspectionEnv.endDate).toLocaleDateString("pt-BR")}`,
      11
    );
  }
  yPosition -= 10;

  // Responsáveis
  addText("RESPONSÁVEIS", 12, true, rgb(31, 41, 55));
  if (inspectionItem?.responsibleConstruction) {
    addText(
      `Responsável da Obra: ${inspectionItem.responsibleConstruction}`,
      11
    );
  }
  if (inspectionItem?.responsibleSupplier) {
    addText(`Responsável da Aluminc: ${inspectionItem.responsibleSupplier}`, 11);
  }
  yPosition -= 10;

  // Observações
  if (inspectionItem?.observations) {
    addText("OBSERVAÇÕES", 12, true, rgb(31, 41, 55));
    addText(inspectionItem.observations, 11);
    yPosition -= 10;
  }

  // Declaração de Entrega
  addText("DECLARAÇÃO DE ENTREGA", 12, true, rgb(31, 41, 55));
  const declaracao = `Declaro que o ambiente acima descrito foi inspecionado e encontra-se em conformidade com os padrões de qualidade da Aluminc. Todos os trabalhos foram executados de acordo com as especificações técnicas e as normas aplicáveis. As informações contidas neste termo de entrega refletem fielmente o estado do ambiente na data de sua emissão.`;
  addText(declaracao, 11);
  yPosition -= 10;

  // Mão de Obra
  if (laborItems.length > 0) {
    addText("MÃO DE OBRA", 12, true, rgb(31, 41, 55));
    laborItems.forEach((item) => {
      addText(
        `• ${item.profession} - ${item.name} (${item.hours} horas)`,
        10
      );
      if (item.notes) {
        addText(`  Observações: ${item.notes}`, 9);
      }
    });
    yPosition -= 5;
  }

  // Equipamentos
  if (equipmentItems.length > 0) {
    addText("EQUIPAMENTOS", 12, true, rgb(31, 41, 55));
    equipmentItems.forEach((item) => {
      addText(`• ${item.name} (${item.quantity} ${item.unit})`, 10);
      if (item.notes) {
        addText(`  Observações: ${item.notes}`, 9);
      }
    });
    yPosition -= 5;
  }

  // Atividades
  if (activityItems.length > 0) {
    addText("ATIVIDADES", 12, true, rgb(31, 41, 55));
    activityItems.forEach((item) => {
      addText(`• ${item.description} (${item.status || "N/A"})`, 10);
      if (item.notes) {
        addText(`  Observações: ${item.notes}`, 9);
      }
    });
    yPosition -= 5;
  }

  // Ocorrências
  if (occurrenceItems.length > 0) {
    addText("OCORRÊNCIAS", 12, true, rgb(31, 41, 55));
    occurrenceItems.forEach((item) => {
      addText(
        `• ${item.description} (Severidade: ${item.severity || "N/A"}, Status: ${item.status || "N/A"})`,
        10
      );
      if (item.notes) {
        addText(`  Observações: ${item.notes}`, 9);
      }
    });
    yPosition -= 5;
  }

  // Materiais Recebidos
  if (receivedMaterialItems.length > 0) {
    addText("MATERIAIS RECEBIDOS", 12, true, rgb(31, 41, 55));
    receivedMaterialItems.forEach((item) => {
      addText(
        `• ${item.name} (${item.quantity} ${item.unit}) - ${new Date(item.receivedDate).toLocaleDateString("pt-BR")}`,
        10
      );
      if (item.notes) {
        addText(`  Observações: ${item.notes}`, 9);
      }
    });
    yPosition -= 5;
  }

  // Materiais Utilizados
  if (usedMaterialItems.length > 0) {
    addText("MATERIAIS UTILIZADOS", 12, true, rgb(31, 41, 55));
    usedMaterialItems.forEach((item) => {
      addText(`• ${item.name} (${item.quantity} ${item.unit})`, 10);
      if (item.notes) {
        addText(`  Observações: ${item.notes}`, 9);
      }
    });
    yPosition -= 5;
  }

  // Comentários
  if (commentItems.length > 0) {
    addText("COMENTÁRIOS", 12, true, rgb(31, 41, 55));
    commentItems.forEach((item) => {
      addText(`• ${item.author}: ${item.content}`, 10);
    });
    yPosition -= 5;
  }

  // Data de emissão
  yPosition -= 20;
  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  addText(`Data de Emissão: ${dataEmissao}`, 11, true);

  // Converter para buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
