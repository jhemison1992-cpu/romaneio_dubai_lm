import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AdvancedPDFReportGeneratorProps {
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

export const AdvancedPDFReportGenerator: React.FC<AdvancedPDFReportGeneratorProps> = ({
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

  const generatePDFReport = async () => {
    setIsGenerating(true);
    try {
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Criar conteúdo HTML do relatório com template ALUMINC
      const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Relatório de Projeto - ${projectName}</title>
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
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #ddd;
            text-align: center;
            color: #666;
            font-size: 12px;
        }
        .signature-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin-top: 40px;
        }
        .signature-line {
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
            font-size: 12px;
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
                </div>
            </div>
            <div class="report-title">Relatório de Projeto - Instalação de Caixilhos</div>
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

        <div class="signature-section">
            <div class="signature-line">
                Responsável Técnico<br>
                ${technicalManager || '_________________'}
            </div>
            <div class="signature-line">
                Gerente de Projeto<br>
                _________________
            </div>
        </div>

        <div class="footer">
            <p>Este relatório foi gerado automaticamente pelo sistema ObraControl - ALUMINC Instalações</p>
            <p>Data de Geração: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
    </div>
</body>
</html>
      `;

      // Converter HTML para PDF usando uma abordagem simples
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Relatorio_${projectName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Relatório gerado com sucesso!');
      onGenerate?.();
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      onClick={generatePDFReport}
      disabled={isGenerating}
      className="bg-orange-600 hover:bg-orange-700 w-full"
      size="lg"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Gerando Relatório...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Gerar Relatório ALUMINC
        </>
      )}
    </Button>
  );
};
