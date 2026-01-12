# Project TODO

## Database & Backend
- [x] Criar tabelas no schema: environments, inspections, inspection_items, media_files
- [x] Implementar queries no db.ts para CRUD de vistorias
- [x] Criar router tRPC para vistorias (listar, criar, atualizar, deletar)
- [x] Criar router tRPC para upload de fotos e vídeos com S3
- [x] Implementar endpoint para geração de PDF com todas as informações

## Frontend - Interface Principal
- [x] Configurar tema e cores profissionais para uso em obra
- [x] Criar layout com DashboardLayout para navegação
- [x] Implementar página de listagem de vistorias
- [x] Criar formulário de vistoria com navegação por abas/cards por ambiente

## Frontend - Funcionalidades de Mídia
- [x] Implementar componente de captura de foto via câmera do tablet
- [x] Implementar componente de upload de fotos existentes
- [x] Implementar componente de captura de vídeo via câmera do tablet
- [x] Implementar componente de upload de vídeos existentes
- [x] Criar galeria de visualização de fotos e vídeos por ambiente
- [x] Adicionar preview de imagens antes do upload

## Frontend - Formulários e Dados
- [x] Pré-carregar dados dos 12 ambientes e caixilhos do DUBAI LM
- [x] Implementar campos editáveis: data liberação, responsável obra, responsável fornecedor, observações
- [x] Implementar salvamento automático no banco de dados
- [x] Adicionar validação de formulários
- [x] Implementar feedback visual de salvamento (toast notifications)

## Relatórios
- [x] Criar endpoint backend para gerar PDF com dados da vistoria
- [x] Incluir fotos e vídeos (thumbnails com links) no PDF
- [x] Implementar botão de exportação de relatório na interface
- [x] Adicionar loading state durante geração do PDF

## Autenticação e Segurança
- [x] Verificar autenticação em todas as rotas protegidas
- [x] Implementar controle de acesso por usuário
- [x] Adicionar página de login/logout

## Testes e Finalização
- [x] Testar responsividade em tablets
- [x] Testar upload de fotos e vídeos
- [x] Testar geração de PDF
- [x] Criar checkpoint final

## Bugs Reportados
- [x] Página de detalhes da vistoria fica travada em "Carregando..."
- [x] Erro de autenticação ao buscar dados da vistoria
- [x] Melhorar tratamento de erros nos componentes

## Novas Funcionalidades Solicitadas
- [x] Adicionar campo de assinatura digital para responsável da obra
- [x] Adicionar campo de assinatura digital para responsável do fornecedor
- [x] Salvar assinaturas no banco de dados (base64)
- [x] Melhorar geração de PDF incluindo fotos dos ambientes
- [x] Incluir assinaturas digitais no PDF gerado
- [x] Adicionar cabeçalho profissional no PDF com dados do empreendimento
- [x] Testar geração de PDF completo com fotos e assinaturas

## Alteração de Acesso
- [x] Remover autenticação obrigatória do sistema
- [x] Tornar todas as rotas públicas (sem necessidade de login)
- [x] Remover verificações de autenticação dos componentes
- [x] Testar acesso público ao sistema

## Branding - Logo ALUMINC
- [x] Copiar logo para pasta public do projeto
- [x] Adicionar logo no cabeçalho do PDF
- [x] Adicionar logo na sidebar da interface web
- [x] Configurar favicon com o logo
- [x] Testar visualização em todas as páginas

## QR Code de Acesso
- [x] Instalar biblioteca de geração de QR Code
- [x] Gerar QR Code com URL do sistema
- [x] Adicionar QR Code no rodapé do PDF
- [x] Testar escaneamento do QR Code

## Ajustes de Nomenclatura
- [x] Alterar nome da vistoria de "Test Inspection" para "Romaneio ALUMINC"

## Plantas Técnicas
- [x] Copiar PDFs das plantas para pasta public do projeto
- [x] Criar mapeamento entre ambientes/caixilhos e PDFs
- [x] Adicionar botão "Ver Planta" em cada ambiente
- [x] Implementar visualização de PDF da planta
- [x] Testar visualização em todos os ambientes

## Generalização do Sistema - Múltiplas Obras
- [x] Remover referências específicas a "DUBAI LM" do sistema
- [x] Criar tabela de obras no banco de dados
- [x] Adicionar campos: nome da obra, endereço, contratante, responsável técnico
- [x] Vincular ambientes e caixilhos a obras específicas
- [x] Criar interface para cadastrar novas obras
- [x] Criar interface para adicionar ambientes personalizados por obra
- [x] Criar interface para adicionar caixilhos personalizados por ambiente
- [x] Atualizar fluxo de criação de romaneio para selecionar obra
- [x] Permitir múltiplos romaneios por obra
- [x] Testar criação de obra e romaneio completo
