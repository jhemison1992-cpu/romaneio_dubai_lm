import { PDFDocument, rgb } from "pdf-lib";
import * as db from "./db";
import fetch from "node-fetch";

/**
 * Gera PDF do termo de entrega com novo layout profissional e fotos
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

  // Buscar fotos do item de inspeção
  let mediaFiles: any[] = [];
  if (inspectionItem) {
    mediaFiles = await db.getMediaFilesByItem(inspectionItem.id);
  }

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

  // Função para adicionar linha horizontal
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

  // Seção de Fotos
  if (mediaFiles.length > 0) {
    yPosition -= 20;
    addLine();
    addText("FOTOS DO AMBIENTE", 11, true, rgb(31, 41, 55));
    yPosition -= 10;

    // Tentar carregar e adicionar fotos
    for (const media of mediaFiles) {
      if (media.mediaType === "photo") {
        try {
          // Tentar buscar a imagem
          const response = await fetch(media.fileUrl);
          if (response.ok) {
            const buffer = await response.buffer();
            
            // Adicionar informações da foto
            addText(`Foto: ${media.fileName}`, 10);
            if (media.comment) {
              addText(`Observação: ${media.comment}`, 9);
            }
            yPosition -= 5;
          }
        } catch (error) {
          // Se não conseguir carregar a foto, apenas adicionar referência
          addText(`Foto: ${media.fileName} (URL: ${media.fileUrl})`, 9);
          if (media.comment) {
            addText(`Observação: ${media.comment}`, 8);
          }
          yPosition -= 5;
        }
      }
    }
  }

  // Data de emissão
  yPosition -= 20;
  const dataEmissao = new Date().toLocaleDateString("pt-BR");
  addText(`Data de Emissão: ${dataEmissao}`, 11, true);

  // Converter para buffer
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}
