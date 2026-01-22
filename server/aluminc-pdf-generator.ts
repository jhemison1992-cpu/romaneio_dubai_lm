import PDFDocument from "pdfkit";
import sharp from "sharp";
import axios from "axios";

interface AlumincPDFData {
  reportNumber: string;
  reportDate: string;
  dayOfWeek: string;
  contract: string;
  contractualDeadline: number;
  elapsedDeadline: number;
  remainingDeadline: number;
  
  project: {
    name: string;
    address: string;
    contractor: string;
    responsibleName: string;
    responsibleEmail?: string;
    responsibleRole?: string;
  };
  
  workingHours?: {
    startTime?: string;
    endTime?: string;
    totalHours?: number;
  };
  
  climateCondition?: string;
  weather?: string;
  generalCondition?: string;
  
  comments?: string;
  objective?: string;
  scope?: string;
  conditions?: string;
  results?: string;
  conclusion?: string;
  
  photos: Array<{
    fileUrl: string;
    fileName: string;
    identifier: string;
    comment?: string;
  }>;
  
  attachments?: Array<{
    name: string;
    size: number;
  }>;
  
  signatures?: Array<{
    name: string;
    email: string;
    role: string;
    timestamp: string;
    status: "approved" | "pending";
  }>;
}

export async function generateAlumincPDF(data: AlumincPDFData): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Colors
      const primaryColor = "#1a472a"; // Dark green
      const accentColor = "#2ecc71"; // Light green
      const textColor = "#333333";
      const lightGray = "#f5f5f5";
      const borderColor = "#cccccc";

      // Page 1: Header and Information
      addHeader(doc, data, primaryColor, accentColor, borderColor);
      addInformationTable(doc, data, primaryColor, borderColor);
      addProjectInfo(doc, data, primaryColor, borderColor);
      addWorkingConditions(doc, data, borderColor);
      addContentSections(doc, data, primaryColor, textColor);

      // Page 2: Photos and Attachments
      doc.addPage();
      addPhotosGrid(doc, data);
      addAttachmentsSection(doc, data, primaryColor, borderColor);
      addSignatures(doc, data, accentColor);

      // Footer
      addFooter(doc, data);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function addHeader(doc: PDFKit.PDFDocument, data: AlumincPDFData, primaryColor: string, accentColor: string, borderColor: string = "#cccccc") {
  // Report title
  doc.fontSize(10).fillColor("#666").text(`Relatório ${data.reportDate} nº ${data.reportNumber}`, { align: "left" });

  // Status badge
  doc.rect(doc.page.width - 100, 40, 60, 20).fill(accentColor);
  doc.fontSize(10).fillColor("white").text("Aprovado", doc.page.width - 95, 45, { width: 50, align: "center" });

  doc.moveDown(1);

  // Logo and title
  doc.fontSize(14).fillColor(primaryColor).font("Helvetica-Bold").text("ALUMINC", 50, 80);
  doc.fontSize(11).fillColor(primaryColor).text("RELATÓRIO ALUMINC - TÉCNICO / OBRAS (MEDIÇÃO)", 50, 100);

  doc.moveTo(40, 130).lineTo(doc.page.width - 40, 130).stroke(borderColor);
  doc.moveDown(1);
}

function addInformationTable(doc: PDFKit.PDFDocument, data: AlumincPDFData, primaryColor: string, borderColor: string) {
  const tableTop = doc.y;
  const colWidth = (doc.page.width - 80) / 2;
  const rowHeight = 25;

  const rows = [
    ["Relatório nº", data.reportNumber],
    ["Data do relatório", data.reportDate],
    ["Dia da semana", data.dayOfWeek],
    ["Contrato", data.contract],
    ["Prazo contratual", `${data.contractualDeadline} dias`],
    ["Prazo decorrido", `${data.elapsedDeadline} dias`],
    ["Prazo a vencer", `${data.remainingDeadline} dias`],
  ];

  rows.forEach((row, index) => {
    const y = tableTop + index * rowHeight;

    // Left cell
    doc.rect(40, y, colWidth, rowHeight).stroke(borderColor);
    doc.fontSize(9).fillColor(primaryColor).font("Helvetica-Bold").text(row[0], 45, y + 5, { width: colWidth - 10 });

    // Right cell
    doc.rect(40 + colWidth, y, colWidth, rowHeight).stroke(borderColor);
    doc.fontSize(9).fillColor("#333").font("Helvetica").text(row[1], 45 + colWidth, y + 5, { width: colWidth - 10 });
  });

  doc.y = tableTop + rows.length * rowHeight + 10;
}

function addProjectInfo(doc: PDFKit.PDFDocument, data: AlumincPDFData, primaryColor: string, borderColor: string) {
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const colWidth = (doc.page.width - 80) / 2;
  const rowHeight = 25;

  const rows = [
    ["Obra", data.project.name],
    ["Local", data.project.address],
    ["Contratante", data.project.contractor],
    ["Responsável", data.project.responsibleName],
  ];

  rows.forEach((row, index) => {
    const y = tableTop + index * rowHeight;

    // Left cell
    doc.rect(40, y, colWidth, rowHeight).stroke(borderColor);
    doc.fontSize(9).fillColor(primaryColor).font("Helvetica-Bold").text(row[0], 45, y + 5, { width: colWidth - 10 });

    // Right cell
    doc.rect(40 + colWidth, y, colWidth, rowHeight).stroke(borderColor);
    doc.fontSize(9).fillColor("#333").font("Helvetica").text(row[1], 45 + colWidth, y + 5, { width: colWidth - 10 });
  });

  doc.y = tableTop + rows.length * rowHeight + 10;
}

function addWorkingConditions(doc: PDFKit.PDFDocument, data: AlumincPDFData, borderColor: string) {
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const colWidth = (doc.page.width - 80) / 4;
  const rowHeight = 25;

  const headers = ["Horário de trabalho", "Horas trabalhadas", "Condição climática", "Tempo"];
  const values = [
    data.workingHours?.startTime || "-",
    data.workingHours?.totalHours?.toString() || "-",
    data.climateCondition || "-",
    data.weather || "-",
  ];

  // Header row
  headers.forEach((header, index) => {
    const x = 40 + index * colWidth;
    doc.rect(x, tableTop, colWidth, rowHeight).fill("#f0f0f0").stroke(borderColor);
    doc.fontSize(8).fillColor("#333").font("Helvetica-Bold").text(header, x + 5, tableTop + 5, { width: colWidth - 10 });
  });

  // Value row
  values.forEach((value, index) => {
    const x = 40 + index * colWidth;
    doc.rect(x, tableTop + rowHeight, colWidth, rowHeight).stroke(borderColor);
    doc.fontSize(8).fillColor("#333").font("Helvetica").text(value, x + 5, tableTop + rowHeight + 5, { width: colWidth - 10 });
  });

  doc.y = tableTop + rowHeight * 2 + 10;
}

function addContentSections(doc: PDFKit.PDFDocument, data: AlumincPDFData, primaryColor: string, textColor: string) {
  doc.moveDown(0.5);

  const sections = [
    { title: "Comentários", content: data.comments },
    { title: "Objetivo", content: data.objective },
    { title: "Escopo da Medição", content: data.scope },
    { title: "Condições Encontradas", content: data.conditions },
    { title: "Resultados da Medição", content: data.results },
    { title: "Conclusão", content: data.conclusion },
  ];

  sections.forEach((section) => {
    if (section.content) {
      doc.fontSize(10).fillColor(primaryColor).font("Helvetica-Bold").text(section.title);
      doc.fontSize(9).fillColor(textColor).font("Helvetica").text(section.content, { align: "justify" });
      doc.moveDown(0.5);
    }
  });
}

async function addPhotosGrid(doc: PDFKit.PDFDocument, data: AlumincPDFData) {
  if (!data.photos || data.photos.length === 0) return;

  doc.fontSize(12).fillColor("#333").font("Helvetica-Bold").text("Fotos");
  doc.moveDown(0.5);

  const photoWidth = (doc.page.width - 80) / 2 - 5;
  const photoHeight = 250;
  let x = 40;
  let y = doc.y;
  let photoIndex = 0;

  for (const photo of data.photos) {
    if (photoIndex >= 4) break; // Max 4 photos per page

    try {
      const response = await axios.get(photo.fileUrl, { responseType: "arraybuffer" });
      const buffer = response.data;
      const optimized = await sharp(buffer).resize(photoWidth - 10, photoHeight - 40, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer();
      
      // Photo frame
      doc.rect(x, y, photoWidth, photoHeight).stroke("#999");

      // Add photo
      doc.image(optimized, x + 5, y + 5, { width: photoWidth - 10, height: photoHeight - 45 });

      // Photo identifier
      doc.fontSize(9).fillColor("#333").font("Helvetica-Bold").text(photo.identifier, x + 5, y + photoHeight - 25, { width: photoWidth - 10 });

      // Move to next position
      photoIndex++;
      if (photoIndex % 2 === 0) {
        x = 40;
        y += photoHeight + 10;
      } else {
        x += photoWidth + 10;
      }
    } catch (error) {
      console.error(`Error processing photo ${photo.identifier}:`, error);
    }
  }

  doc.y = y + photoHeight + 20;
}

function addAttachmentsSection(doc: PDFKit.PDFDocument, data: AlumincPDFData, primaryColor: string, borderColor: string) {
  if (!data.attachments || data.attachments.length === 0) return;

  doc.moveDown(1);
  doc.fontSize(12).fillColor(primaryColor).font("Helvetica-Bold").text("Anexos");

  const tableTop = doc.y;
  const colWidth1 = (doc.page.width - 80) * 0.7;
  const colWidth2 = (doc.page.width - 80) * 0.3;
  const rowHeight = 25;

  // Header
  doc.rect(40, tableTop, colWidth1, rowHeight).fill("#f0f0f0").stroke(borderColor);
  doc.fontSize(9).fillColor(primaryColor).font("Helvetica-Bold").text("Arquivo", 45, tableTop + 5, { width: colWidth1 - 10 });

  doc.rect(40 + colWidth1, tableTop, colWidth2, rowHeight).fill("#f0f0f0").stroke(borderColor);
  doc.fontSize(9).fillColor(primaryColor).font("Helvetica-Bold").text("Tamanho", 45 + colWidth1, tableTop + 5, { width: colWidth2 - 10 });

  // Rows
  data.attachments.forEach((attachment, index) => {
    const y = tableTop + (index + 1) * rowHeight;

    doc.rect(40, y, colWidth1, rowHeight).stroke(borderColor);
    doc.fontSize(9).fillColor("#0066cc").font("Helvetica-Underline").text(attachment.name, 45, y + 5, { width: colWidth1 - 10 });

    doc.rect(40 + colWidth1, y, colWidth2, rowHeight).stroke(borderColor);
    const sizeText = attachment.size > 1024 * 1024 ? `${(attachment.size / (1024 * 1024)).toFixed(1)} MB` : `${(attachment.size / 1024).toFixed(0)} KB`;
    doc.fontSize(9).fillColor("#333").font("Helvetica").text(sizeText, 45 + colWidth1, y + 5, { width: colWidth2 - 10 });
  });

  doc.y = tableTop + (data.attachments.length + 1) * rowHeight + 10;
}

function addSignatures(doc: PDFKit.PDFDocument, data: AlumincPDFData, accentColor: string) {
  if (!data.signatures || data.signatures.length === 0) return;

  doc.moveDown(1);

  const signatureWidth = (doc.page.width - 80) / 2 - 5;
  let x = 40;

  data.signatures.forEach((signature, index) => {
    // Signature box
    doc.rect(x, doc.y, signatureWidth, 120).stroke("#999");

    // Status badge
    if (signature.status === "approved") {
      doc.rect(x + signatureWidth - 70, doc.y, 65, 20).fill(accentColor);
      doc.fontSize(9).fillColor("white").font("Helvetica-Bold").text("Aprovado", x + signatureWidth - 65, doc.y + 3, { width: 60, align: "center" });
    }

    // Signature line
    doc.moveTo(x + 10, doc.y + 70).lineTo(x + signatureWidth - 10, doc.y + 70).stroke("#999");

    // Name and details
    doc.fontSize(9).fillColor("#333").font("Helvetica-Bold").text(signature.name, x + 10, doc.y + 75);
    doc.fontSize(8).fillColor("#666").font("Helvetica").text(signature.email, x + 10, doc.y + 90);
    doc.fontSize(8).fillColor("#666").font("Helvetica").text(signature.role, x + 10, doc.y + 103);
    doc.fontSize(7).fillColor("#999").font("Helvetica").text(signature.timestamp, x + 10, doc.y + 113);

    // Move to next position
    if (index % 2 === 0) {
      x += signatureWidth + 10;
    } else {
      x = 40;
      doc.moveDown(7);
    }
  });
}

function addFooter(doc: PDFKit.PDFDocument, data: AlumincPDFData) {
  const pageCount = doc.bufferedPageRange().count;
  for (let i = 0; i < pageCount; i++) {
    doc.switchToPage(i);
    doc.fontSize(8).fillColor("#999").text(`${i + 1} / ${pageCount}`, doc.page.width - 80, doc.page.height - 30, { align: "right" });
    doc.text(`Criado em: ${new Date().toLocaleString("pt-BR")}`, 40, doc.page.height - 30);
  }
}
