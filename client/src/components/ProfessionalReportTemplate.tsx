import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Plus, Trash2, Eye, Edit2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ProjectInfo {
  name: string;
  address: string;
  contractor: string;
  supplier: string;
  technicalManager: string;
  startDate: string;
  endDate: string;
}

interface ReportPhoto {
  id: string;
  url: string;
  caption: string;
  environment: string;
}

interface ReportSignature {
  name: string;
  role: string;
  date: string;
  signature: string;
}

interface ProfessionalReportTemplateProps {
  projectInfo: ProjectInfo;
  windows: Array<{
    id: number;
    name: string;
    caixilhoCode: string;
    quantity: number;
    status: string;
  }>;
  onGeneratePDF?: () => void;
}

export default function ProfessionalReportTemplate({
  projectInfo,
  windows,
  onGeneratePDF,
}: ProfessionalReportTemplateProps) {
  const [photos, setPhotos] = useState<ReportPhoto[]>([]);
  const [signatures, setSignatures] = useState<ReportSignature[]>([]);
  const [observations, setObservations] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [newPhoto, setNewPhoto] = useState({ url: '', caption: '', environment: '' });
  const [newSignature, setNewSignature] = useState({ name: '', role: '', date: new Date().toISOString().split('T')[0], signature: '' });

  const addPhoto = () => {
    if (newPhoto.url && newPhoto.caption) {
      setPhotos([...photos, { id: Date.now().toString(), ...newPhoto }]);
      setNewPhoto({ url: '', caption: '', environment: '' });
    }
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const addSignature = () => {
    if (newSignature.name && newSignature.role) {
      setSignatures([...signatures, newSignature]);
      setNewSignature({ name: '', role: '', date: new Date().toISOString().split('T')[0], signature: '' });
    }
  };

  const removeSignature = (index: number) => {
    setSignatures(signatures.filter((_, i) => i !== index));
  };

  const completedWindows = windows.filter(w => w.status === 'completed').length;
  const progressPercentage = windows.length > 0 ? Math.round((completedWindows / windows.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-8 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">ALUMINC INSTALAÇÕES</h1>
            <p className="text-orange-100">Relatório de Acompanhamento de Projeto</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-orange-100">Data de Geração</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </div>

      {/* Project Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Dados da Obra</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Nome da Obra</p>
                  <p className="font-medium">{projectInfo.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Endereço</p>
                  <p className="font-medium">{projectInfo.address}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contratante</p>
                  <p className="font-medium">{projectInfo.contractor}</p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Dados Técnicos</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Fornecedor</p>
                  <p className="font-medium">{projectInfo.supplier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Responsável Técnico</p>
                  <p className="font-medium">{projectInfo.technicalManager}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Período</p>
                  <p className="font-medium">{projectInfo.startDate} a {projectInfo.endDate}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso de Instalação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Progresso Geral</span>
                <span className="text-2xl font-bold text-orange-600">{progressPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-orange-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total de Caixilhos</p>
                <p className="text-2xl font-bold text-blue-600">{windows.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Concluído</p>
                <p className="text-2xl font-bold text-green-600">{completedWindows}</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Pendente</p>
                <p className="text-2xl font-bold text-yellow-600">{windows.length - completedWindows}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="windows" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="windows">Caixilhos</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
          <TabsTrigger value="observations">Observações</TabsTrigger>
          <TabsTrigger value="signatures">Assinaturas</TabsTrigger>
        </TabsList>

        {/* Windows Tab */}
        <TabsContent value="windows">
          <Card>
            <CardHeader>
              <CardTitle>Especificação de Caixilhos</CardTitle>
              <CardDescription>Lista completa de caixilhos do projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-bold">Código</TableHead>
                      <TableHead className="font-bold">Ambiente</TableHead>
                      <TableHead className="font-bold text-right">Quantidade</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {windows.map((window) => (
                      <TableRow key={window.id} className="hover:bg-muted/50">
                        <TableCell className="font-mono font-bold">{window.caixilhoCode}</TableCell>
                        <TableCell>{window.name}</TableCell>
                        <TableCell className="text-right font-semibold">{window.quantity}</TableCell>
                        <TableCell>
                          {window.status === 'completed' ? (
                            <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photos Tab */}
        <TabsContent value="photos">
          <Card>
            <CardHeader>
              <CardTitle>Galeria de Fotos</CardTitle>
              <CardDescription>Fotos do progresso da instalação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Photo Form */}
              {editMode && (
                <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                  <h4 className="font-semibold">Adicionar Foto</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">URL da Foto</label>
                      <Input
                        placeholder="https://..."
                        value={newPhoto.url}
                        onChange={(e) => setNewPhoto({ ...newPhoto, url: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Ambiente</label>
                      <Input
                        placeholder="Ex: SUÍTES - ÁTRIO"
                        value={newPhoto.environment}
                        onChange={(e) => setNewPhoto({ ...newPhoto, environment: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Legenda</label>
                      <Input
                        placeholder="Descrição da foto"
                        value={newPhoto.caption}
                        onChange={(e) => setNewPhoto({ ...newPhoto, caption: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={addPhoto}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditMode(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Photo Gallery */}
              {photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photos.map((photo) => (
                    <div key={photo.id} className="border rounded-lg overflow-hidden">
                      <img src={photo.url} alt={photo.caption} className="w-full h-40 object-cover" />
                      <div className="p-3 space-y-2">
                        <p className="text-sm font-medium">{photo.caption}</p>
                        <p className="text-xs text-muted-foreground">{photo.environment}</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removePhoto(photo.id)}
                          className="w-full"
                        >
                          <Trash2 className="h-3 w-3 mr-2" />
                          Remover
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">Nenhuma foto adicionada</p>
                </div>
              )}

              {!editMode && (
                <Button onClick={() => setEditMode(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Foto
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Observations Tab */}
        <TabsContent value="observations">
          <Card>
            <CardHeader>
              <CardTitle>Observações e Comentários</CardTitle>
              <CardDescription>Informações adicionais sobre o projeto</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Descreva qualquer observação, problema ou informação importante sobre a instalação..."
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                className="min-h-[200px]"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Signatures Tab */}
        <TabsContent value="signatures">
          <Card>
            <CardHeader>
              <CardTitle>Assinaturas e Aprovações</CardTitle>
              <CardDescription>Registre as assinaturas de aprovação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add Signature Form */}
              <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
                <h4 className="font-semibold">Adicionar Assinatura</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Nome</label>
                    <Input
                      placeholder="Nome completo"
                      value={newSignature.name}
                      onChange={(e) => setNewSignature({ ...newSignature, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Cargo/Função</label>
                    <Input
                      placeholder="Ex: Engenheiro, Supervisor"
                      value={newSignature.role}
                      onChange={(e) => setNewSignature({ ...newSignature, role: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data</label>
                    <Input
                      type="date"
                      value={newSignature.date}
                      onChange={(e) => setNewSignature({ ...newSignature, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Assinatura</label>
                    <Input
                      placeholder="Assinatura digital ou iniciais"
                      value={newSignature.signature}
                      onChange={(e) => setNewSignature({ ...newSignature, signature: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={addSignature} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Assinatura
                </Button>
              </div>

              {/* Signatures List */}
              {signatures.length > 0 && (
                <div className="space-y-3">
                  {signatures.map((sig, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">{sig.name}</p>
                          <p className="text-sm text-muted-foreground">{sig.role}</p>
                          <p className="text-xs text-muted-foreground">{sig.date}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeSignature(idx)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      {sig.signature && (
                        <p className="text-sm border-t pt-2">Assinatura: {sig.signature}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Export Button */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          Visualizar
        </Button>
        <Button onClick={onGeneratePDF} className="gap-2 bg-orange-600 hover:bg-orange-700">
          <Download className="h-4 w-4" />
          Gerar PDF
        </Button>
      </div>
    </div>
  );
}
