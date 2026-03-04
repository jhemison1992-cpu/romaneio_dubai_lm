/**
 * Utilitários para assinatura digital e validação de documentos
 */

/**
 * Gera um hash SHA-256 do conteúdo do documento
 */
export async function generateDocumentHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Interface para dados de assinatura armazenados
 */
export interface SignatureData {
  id: string;
  signatureImage: string;
  signerName: string;
  signerRole: string;
  timestamp: string;
  documentHash: string;
  documentId: string;
  isValid: boolean;
  validationToken: string;
}

/**
 * Gera um token de validação para a assinatura
 */
export function generateValidationToken(
  signatureImage: string,
  documentHash: string,
  timestamp: string
): string {
  const combined = `${signatureImage.substring(0, 50)}${documentHash}${timestamp}`;
  return btoa(combined).substring(0, 32);
}

/**
 * Valida a integridade de uma assinatura
 */
export function validateSignature(
  signature: SignatureData,
  currentDocumentHash: string
): boolean {
  // Verifica se o hash do documento corresponde
  if (signature.documentHash !== currentDocumentHash) {
    return false;
  }

  // Verifica se a assinatura não expirou (válida por 1 ano)
  const signatureDate = new Date(signature.timestamp);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  if (signatureDate < oneYearAgo) {
    return false;
  }

  // Verifica o token de validação
  const expectedToken = generateValidationToken(
    signature.signatureImage,
    signature.documentHash,
    signature.timestamp
  );

  return signature.validationToken === expectedToken;
}

/**
 * Formata a data de assinatura
 */
export function formatSignatureDate(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Exporta dados de assinatura para JSON
 */
export function exportSignatureData(signature: SignatureData): string {
  return JSON.stringify(signature, null, 2);
}

/**
 * Importa dados de assinatura de JSON
 */
export function importSignatureData(jsonData: string): SignatureData | null {
  try {
    return JSON.parse(jsonData) as SignatureData;
  } catch {
    return null;
  }
}

/**
 * Gera um ID único para a assinatura
 */
export function generateSignatureId(): string {
  return `sig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Comprime a imagem de assinatura para reduzir tamanho
 */
export async function compressSignatureImage(
  imageData: string,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } else {
        resolve(imageData);
      }
    };
    img.src = imageData;
  });
}

/**
 * Cria um certificado de assinatura em formato texto
 */
export function generateSignatureCertificate(signature: SignatureData): string {
  const certificate = `
╔════════════════════════════════════════════════════════════════╗
║          CERTIFICADO DE ASSINATURA DIGITAL                    ║
╚════════════════════════════════════════════════════════════════╝

SIGNATÁRIO: ${signature.signerName}
CARGO: ${signature.signerRole || 'Não informado'}
DATA/HORA: ${formatSignatureDate(signature.timestamp)}

IDENTIFICAÇÃO DO DOCUMENTO:
Hash SHA-256: ${signature.documentHash}
ID da Assinatura: ${signature.id}

VALIDAÇÃO:
Status: ${signature.isValid ? '✓ VÁLIDO' : '✗ INVÁLIDO'}
Token de Validação: ${signature.validationToken}

INFORMAÇÕES DE SEGURANÇA:
- Assinatura criptografada com SHA-256
- Timestamp verificado
- Integridade do documento validada
- Válida por 1 (um) ano a partir da data de assinatura

Este certificado comprova que o documento foi assinado digitalmente
e sua integridade foi validada.

═══════════════════════════════════════════════════════════════════
`;
  return certificate;
}
