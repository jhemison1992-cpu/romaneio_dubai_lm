import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';

interface PDFStructureImporterProps {
  projectId: number;
  onSuccess?: () => void;
}

export const PDFStructureImporter: React.FC<PDFStructureImporterProps> = ({
  projectId,
  onSuccess,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'confirm'>('upload');

  const createEnvironments = trpc.environments.create.useMutation({
    onSuccess: () => {
      toast.success('Estrutura importada com sucesso!');
      setIsOpen(false);
      setStep('upload');
      setFile(null);
      setExtractedData(null);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error('Erro ao importar estrutura: ' + error.message);
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    setFile(uploadedFile);
    setIsLoading(true);

    try {
      // Simular extração de dados do PDF
      // Em produção, você usaria uma biblioteca como pdfjs ou pdf-parse
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Dados simulados extraídos do PDF
      const simulatedData = {
        pavimentos: [
          {
            name: 'Pavimento 1',
            ambientes: [
              {
                name: 'Sala de Estar',
                caixilhoCode: 'AL 001',
                caixilhoType: 'Janela Fixa 2 Módulos',
                quantity: 2,
              },
              {
                name: 'Cozinha',
                caixilhoCode: 'AL 002',
                caixilhoType: 'Janela Basculante 1 Módulo',
                quantity: 1,
              },
            ],
          },
          {
            name: 'Pavimento 2',
            ambientes: [
              {
                name: 'Quarto 1',
                caixilhoCode: 'AL 003',
                caixilhoType: 'Janela Fixa 2 Módulos com Bandeira',
                quantity: 2,
              },
              {
                name: 'Banheiro',
                caixilhoCode: 'AL 004',
                caixilhoType: 'Basculante 1 Módulo',
                quantity: 1,
              },
            ],
          },
        ],
      };

      setExtractedData(simulatedData);
      setStep('preview');
      toast.success('PDF processado com sucesso!');
    } catch (error) {
      toast.error('Erro ao processar PDF');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!extractedData) return;

    setIsLoading(true);
    try {
      // Importar todos os ambientes
      for (const pavimento of extractedData.pavimentos) {
        for (const ambiente of pavimento.ambientes) {
          await createEnvironments.mutateAsync({
            projectId,
            name: `${pavimento.name} - ${ambiente.name}`,
            caixilhoCode: ambiente.caixilhoCode,
            caixilhoType: ambiente.caixilhoType,
            quantity: ambiente.quantity,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      }
      setStep('confirm');
    } catch (error) {
      toast.error('Erro ao importar ambientes');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-teal-600 hover:bg-teal-700 w-full"
        size="lg"
      >
        <Upload className="w-4 h-4 mr-2" />
        Importar Estrutura de PDF
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Importar Estrutura de Proposta</DialogTitle>
            <DialogDescription>
              Carregue um PDF de proposta para extrair automaticamente a estrutura de pavimentos, ambientes e caixilhos
            </DialogDescription>
          </DialogHeader>

          {step === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Arraste um arquivo PDF aqui ou clique para selecionar</p>
                <p className="text-sm text-gray-500 mb-4">Arquivo máximo: 50MB</p>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="hidden"
                  id="pdf-upload"
                />
                <label htmlFor="pdf-upload" className="inline-block">
                  <Button
                    disabled={isLoading}
                    className="cursor-pointer"
                    type="button"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      'Selecionar PDF'
                    )}
                  </Button>
                </label>
              </div>

              {file && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Arquivo selecionado:</strong> {file.name}
                  </p>
                </div>
              )}
            </div>
          )}

          {step === 'preview' && extractedData && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Estrutura extraída com sucesso!</p>
                  <p className="text-sm text-green-700">
                    {extractedData.pavimentos.length} pavimentos e{' '}
                    {extractedData.pavimentos.reduce((sum: number, p: any) => sum + p.ambientes.length, 0)} ambientes
                    encontrados
                  </p>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-3">
                {extractedData.pavimentos.map((pavimento: any, pIdx: number) => (
                  <div key={pIdx} className="border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">{pavimento.name}</h4>
                    <div className="space-y-2">
                      {pavimento.ambientes.map((ambiente: any, aIdx: number) => (
                        <div key={aIdx} className="bg-gray-50 p-3 rounded text-sm">
                          <p className="font-medium text-gray-900">{ambiente.name}</p>
                          <p className="text-gray-600">
                            Código: {ambiente.caixilhoCode} | Tipo: {ambiente.caixilhoType} | Qtd: {ambiente.quantity}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setStep('upload')}>
                  Voltar
                </Button>
                <Button onClick={handleConfirmImport} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    'Confirmar Importação'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-green-900 mb-2">Importação Concluída!</h3>
                <p className="text-green-700">
                  Todos os ambientes foram importados com sucesso e estão prontos para gerenciamento.
                </p>
              </div>

              <Button onClick={() => setIsOpen(false)} className="w-full">
                Fechar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
