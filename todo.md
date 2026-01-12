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
