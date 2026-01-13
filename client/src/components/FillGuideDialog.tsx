import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, CheckCircle2, Camera, FileText, Pencil } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function FillGuideDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <HelpCircle className="h-4 w-4" />
          Como Preencher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Guia de Preenchimento do Romaneio</DialogTitle>
          <DialogDescription>
            Siga este passo a passo para preencher corretamente o romaneio de liberação
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Passo 1 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Selecione o Ambiente</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Clique nas abas superiores para escolher o ambiente que deseja liberar. Cada aba representa um local da obra com seus respectivos caixilhos.
                  </p>
                  <div className="bg-muted p-3 rounded-md text-sm">
                    <strong>Dica:</strong> Você pode preencher os ambientes em qualquer ordem. Os dados são salvos individualmente para cada ambiente.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 2 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Preencha os Dados de Liberação
                  </h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Data de Liberação:</strong> Selecione a data em que o ambiente está sendo liberado para a próxima etapa da obra</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Responsável da Obra:</strong> Nome completo do engenheiro ou responsável técnico da construtora</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Responsável da Aluminc:</strong> Nome do representante da Aluminc que está fazendo a vistoria</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Observações:</strong> Descreva o status atual da instalação, pendências, ou qualquer informação relevante sobre o ambiente</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Passo 3 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Pencil className="h-5 w-5" />
                    Colete as Assinaturas
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    As assinaturas são essenciais para validar a liberação do ambiente. Use o dedo ou stylus para assinar diretamente na tela.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Assinatura do Responsável da Obra:</strong> Deve ser coletada do engenheiro ou responsável técnico</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Assinatura do Responsável da Aluminc:</strong> Assinatura do representante da Aluminc</span>
                    </li>
                  </ul>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-md text-sm mt-3">
                    <strong>⚠️ Importante:</strong> Use o botão "Limpar" se precisar refazer alguma assinatura.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 4 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  4
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Camera className="h-5 w-5" />
                    Adicione Fotos e Vídeos (Opcional)
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Registre visualmente o estado atual do ambiente. Isso serve como comprovação e histórico da vistoria.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Tirar Foto:</strong> Use a câmera do dispositivo para capturar imagens do ambiente</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Selecionar Foto:</strong> Escolha fotos já existentes na galeria do dispositivo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                      <span><strong>Gravar/Selecionar Vídeo:</strong> Capture vídeos para documentar detalhes importantes</span>
                    </li>
                  </ul>
                  <div className="bg-muted p-3 rounded-md text-sm mt-3">
                    <strong>Dica:</strong> Fotografe detalhes importantes como instalações concluídas, pendências, ou áreas que necessitam atenção especial.
                  </div>
                </div>
              </div>
            </div>

            {/* Passo 5 */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 font-semibold">
                  5
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">Salve os Dados</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Após preencher todos os campos necessários, clique no botão <strong>"Salvar Dados"</strong> no final da página. Os dados serão salvos automaticamente no sistema.
                  </p>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-md text-sm">
                    <strong>✓ Lembre-se:</strong> Você deve salvar os dados de cada ambiente individualmente. Repita o processo para todos os ambientes que precisam ser liberados.
                  </div>
                </div>
              </div>
            </div>

            {/* Dicas Finais */}
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-lg mb-3">📋 Dicas Importantes</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Preencha as observações com o máximo de detalhes possível sobre o status da instalação</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>As assinaturas são obrigatórias para validar a liberação do ambiente</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Fotos e vídeos ajudam a documentar o histórico e evitar divergências futuras</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Após salvar todos os ambientes, você pode gerar o PDF completo do romaneio</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">•</span>
                  <span>Use o botão "Ver Planta" para visualizar a planta baixa do ambiente (quando disponível)</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
