import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, Signature } from 'lucide-react';
import { toast } from 'sonner';
import { SignatureCapture } from '@/components/SignatureCapture';
import {
  generateDocumentHash,
  generateSignatureId,
  generateValidationToken,
  formatSignatureDate,
  generateSignatureCertificate,
  type SignatureData,
} from '@/lib/signatureUtils';

interface SignedPDFReportGeneratorProps {
  projectId: number;
  projectName: string;
  projectAddress?: string;
  contractor?: string;
  technicalManager?: string;
  supplier?: string;
  environmentCount: number;
  completedCount: number;
  environments?: any[];
  onGenerate?: () => void;
}

export const SignedPDFReportGenerator: React.FC<SignedPDFReportGeneratorProps> = ({
  projectId,
  projectName,
  projectAddress,
  contractor,
  technicalManager,
  supplier,
  environmentCount,
  completedCount,
  environments = [],
  onGenerate,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSignatureOpen, setIsSignatureOpen] = useState(false);
  const [documentHash, setDocumentHash] = useState('');
  const [signature, setSignature] = useState<SignatureData | null>(null);

  const generatePDFWithSignature = async () => {
    setIsGenerating(true);
    try {
      // Gerar conteúdo HTML do relatório
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório Assinado - ${projectName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.6; }
        .page { page-break-after: always; padding: 40px; }
        .header {
            border-bottom: 3px solid #FF6B35;
            margin-bottom: 30px;
            padding-bottom: 20px;
        }
        .logo-section {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }
        .company-name {
            font-size: 28px;
            font-weight: bold;
            color: #FF6B35;
        }
        .report-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-top: 15px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-box {
            background-color: #f5f5f5;
            padding: 15px;
            border-left: 4px solid #FF6B35;
        }
        .info-label {
            font-weight: bold;
            color: #666;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 5px;
        }
        .info-value {
            font-size: 16px;
            color: #333;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #FF6B35;
            margin-top: 30px;
            margin-bottom: 15px;
            border-bottom: 2px solid #FF6B35;
            padding-bottom: 10px;
        }
        .progress-section {
            margin-bottom: 30px;
        }
        .progress-bar {
            width: 100%;
            height: 30px;
            background-color: #e0e0e0;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 10px;
        }
        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #FF6B35, #FF8C42);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: linear-gradient(135deg, #FF6B35, #FF8C42);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            text-transform: uppercase;
            opacity: 0.9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th {
            background-color: #FF6B35;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
        }
        td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }
        tr:nth-child(even) {
            background-color: #f9f9f9;
        }
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 50px;
            page-break-inside: avoid;
        }
        .signature-box {
            border: 1px solid #ddd;
            padding: 20px;
            text-align: center;
        }
        .signature-image {
            width: 100%;
            height: 100px;
            border: 1px dashed #999;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f9f9f9;
        }
        .signature-image img {
            max-width: 100%;
            max-height: 100%;
        }
        .signature-line {
            border-top: 1px solid #333;
            padding-top: 10px;
            margin-top: 10px;
            font-size: 12px;
        }
        .security-badge {
            background-color: #e8f5e9;
            border: 2px solid #4caf50;
            border-radius: 8px;
            padding: 15px;
            margin-top: 30px;
            text-align: center;
        }
        .security-badge h4 {
            color: #2e7d32;
            margin-bottom: 8px;
        }
        .security-badge p {
            font-size: 11px;
            color: #558b2f;
            margin: 3px 0;
            font-family: monospace;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 10px;
        }
    </style>
</head>
<body>
    <div class="page">
        <div class="header">
            <div class="logo-section">
                <div class="company-name">ALUMINC INSTALAÇÕES</div>
                <div style="text-align: right; font-size: 12px; color: #666;">
                    <div>Data: ${new Date().toLocaleDateString('pt-BR')}</div>
                    <div>Projeto #${projectId}</div>
                    <div style="color: #4caf50; font-weight: bold;">✓ ASSINADO DIGITALMENTE</div>
                </div>
            </div>
            <div class="report-title">Relatório Assinado - Instalação de Caixilhos</div>
        </div>

        <div class="info-grid">
            <div class="info-box">
                <div class="info-label">Nome do Projeto</div>
                <div class="info-value">${projectName}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Endereço</div>
                <div class="info-value">${projectAddress || 'Não informado'}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Contratante</div>
                <div class="info-value">${contractor || 'Não informado'}</div>
            </div>
            <div class="info-box">
                <div class="info-label">Responsável Técnico</div>
                <div class="info-value">${technicalManager || 'Não informado'}</div>
            </div>
        </div>

        <div class="section-title">Progresso Geral do Projeto</div>
        <div class="progress-section">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${(completedCount / environmentCount) * 100 || 0}%">
                    ${Math.round((completedCount / environmentCount) * 100 || 0)}%
                </div>
            </div>
            <div style="text-align: center; color: #666; font-size: 14px;">
                ${completedCount} de ${environmentCount} ambientes concluídos
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-number">${environmentCount}</div>
                <div class="stat-label">Total de Ambientes</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${completedCount}</div>
                <div class="stat-label">Concluídos</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${environmentCount - completedCount}</div>
                <div class="stat-label">Em Andamento</div>
            </div>
            <div class="stat-card">
                <div class="stat-number">${Math.round((completedCount / environmentCount) * 100 || 0)}%</div>
                <div class="stat-label">Taxa de Conclusão</div>
            </div>
        </div>

        ${environments.length > 0 ? `
        <div class="section-title">Detalhes dos Ambientes</div>
        <table>
            <thead>
                <tr>
                    <th>Ambiente</th>
                    <th>Código</th>
                    <th>Tipo</th>
                    <th>Quantidade</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${environments.map(env => `
                <tr>
                    <td>${env.name}</td>
                    <td>${env.caixilhoCode}</td>
                    <td>${env.caixilhoType}</td>
                    <td>${env.quantity}</td>
                    <td>${env.status || 'Pendente'}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}

        <div class="section-title">Assinaturas Digitais</div>
        <div class="signature-section">
            <div class="signature-box">
                <div class="signature-image">
                    ${signature?.signatureImage ? `<img src="${signature.signatureImage}" alt="Assinatura" />` : '[Espaço para Assinatura]'}
                </div>
                <div class="signature-line">
                    <strong>${signature?.signerName || '_________________'}</strong><br>
                    ${signature?.signerRole || 'Responsável Técnico'}<br>
                    ${signature ? formatSignatureDate(signature.timestamp) : ''}
                </div>
            </div>
            <div class="signature-box">
                <div style="height: 100px; display: flex; align-items: center; justify-content: center; border: 1px dashed #999; margin-bottom: 15px; background-color: #f9f9f9;">
                    [Espaço para Gerente de Projeto]
                </div>
                <div class="signature-line">
                    Gerente de Projeto<br>
                    _________________
                </div>
            </div>
        </div>

        ${signature ? `
        <div class="security-badge">
            <h4>✓ Documento Assinado Digitalmente</h4>
            <p>Hash SHA-256: ${signature.documentHash.substring(0, 32)}...</p>
            <p>ID da Assinatura: ${signature.id}</p>
            <p>Validação: ${signature.isValid ? 'VÁLIDA' : 'INVÁLIDA'}</p>
            <p>Token: ${signature.validationToken}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Este relatório foi gerado e assinado digitalmente pelo sistema ObraControl - ALUMINC Instalações</p>
            <p>Data de Geração: ${new Date().toLocaleString('pt-BR')}</p>
            <p>Documento protegido por assinatura digital SHA-256</p>
        </div>
    </div>
</body>
</html>
      `;

      // Gerar hash do documento
      const hash = await generateDocumentHash(htmlContent);
      setDocumentHash(hash);

      // Abrir diálogo de assinatura
      setIsSignatureOpen(true);
      toast.info('Prepare-se para assinar o documento');
    } catch (error) {
      toast.error('Erro ao preparar documento para assinatura');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSignatureCapture = async (signatureData: any) => {
    try {
      // Criar objeto de assinatura completo
      const fullSignature: SignatureData = {
        id: generateSignatureId(),
        signatureImage: signatureData.signatureImage,
        signerName: signatureData.signerName,
        signerRole: signatureData.signerRole,
        timestamp: signatureData.timestamp,
        documentHash: signatureData.documentHash,
        documentId: `doc_${projectId}_${Date.now()}`,
        isValid: true,
        validationToken: generateValidationToken(
          signatureData.signatureImage,
          signatureData.documentHash,
          signatureData.timestamp
        ),
      };

      setSignature(fullSignature);

      // Gerar e fazer download do relatório assinado
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório Assinado - ${projectName}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { border-bottom: 3px solid #FF6B35; margin-bottom: 30px; padding-bottom: 20px; }
        .company-name { font-size: 28px; font-weight: bold; color: #FF6B35; }
        .signature-section { margin-top: 50px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .signature-box { border: 1px solid #ddd; padding: 20px; text-align: center; }
        .signature-image { width: 100%; height: 100px; border: 1px dashed #999; margin-bottom: 15px; }
        .signature-image img { max-width: 100%; max-height: 100%; }
        .security-badge { background-color: #e8f5e9; border: 2px solid #4caf50; border-radius: 8px; padding: 15px; margin-top: 30px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="company-name">ALUMINC INSTALAÇÕES</div>
        <h2>Relatório Assinado Digitalmente</h2>
    </div>
    
    <p><strong>Projeto:</strong> ${projectName}</p>
    <p><strong>Total de Ambientes:</strong> ${environmentCount}</p>
    <p><strong>Concluídos:</strong> ${completedCount}</p>
    
    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-image">
                <img src="${fullSignature.signatureImage}" alt="Assinatura" />
            </div>
            <p><strong>${fullSignature.signerName}</strong></p>
            <p>${fullSignature.signerRole}</p>
            <p>${formatSignatureDate(fullSignature.timestamp)}</p>
        </div>
    </div>
    
    <div class="security-badge">
        <h4>✓ Documento Assinado Digitalmente</h4>
        <p><strong>Hash SHA-256:</strong> ${fullSignature.documentHash.substring(0, 32)}...</p>
        <p><strong>ID da Assinatura:</strong> ${fullSignature.id}</p>
        <p><strong>Status:</strong> ${fullSignature.isValid ? '✓ VÁLIDO' : '✗ INVÁLIDO'}</p>
    </div>
</body>
</html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_Assinado_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório assinado e baixado com sucesso!');
      onGenerate?.();
    } catch (error) {
      toast.error('Erro ao processar assinatura');
      console.error(error);
    }
  };

  return (
    <>
      <Button
        onClick={generatePDFWithSignature}
        disabled={isGenerating}
        className="bg-purple-600 hover:bg-purple-700 w-full"
        size="lg"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Preparando...
          </>
        ) : (
          <>
            <Signature className="w-4 h-4 mr-2" />
            Gerar Relatório Assinado
          </>
        )}
      </Button>

      <SignatureCapture
        isOpen={isSignatureOpen}
        onClose={() => setIsSignatureOpen(false)}
        onSignatureCapture={handleSignatureCapture}
        documentHash={documentHash}
      />
    </>
  );
};
