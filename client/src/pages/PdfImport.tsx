import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Upload, CheckCircle, AlertCircle, FileText } from "lucide-react";
import { storagePut } from "@/lib/storage";

export default function PdfImport() {
  const { projectId } = useParams<{ projectId: string }>();
  const [, navigate] = useLocation();
  const projectIdNum = parseInt(projectId || "0");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  // Queries
  const floorsQuery = trpc.pdf.getFloors.useQuery(
    { projectId: projectIdNum },
    { enabled: !!projectIdNum }
  );

  const importsQuery = trpc.pdf.getImports.useQuery(
    { projectId: projectIdNum },
    { enabled: !!projectIdNum }
  );

  // Mutations
  const importMutation = trpc.pdf.import.useMutation({
    onSuccess: (data) => {
      setUploadSuccess(true);
      setSelectedFile(null);
      floorsQuery.refetch();
      importsQuery.refetch();
      setTimeout(() => setUploadSuccess(false), 3000);
    },
    onError: (error) => {
      setUploadError(error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError("Por favor, selecione um arquivo PDF válido");
      setSelectedFile(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError("Por favor, solte um arquivo PDF válido");
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      // Upload PDF para S3
      const { url, key } = await storagePut(
        `pdf-imports/${projectIdNum}/${Date.now()}-${selectedFile.name}`,
        selectedFile,
        "application/pdf"
      );

      // Importar dados
      await importMutation.mutateAsync({
        projectId: projectIdNum,
        pdfUrl: url,
        pdfFileName: selectedFile.name,
        pdfFileKey: key,
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Erro ao fazer upload");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Importar Proposta PDF</h1>
          <p className="text-muted-foreground mt-2">
            Carregue um PDF de proposta para criar automaticamente pavimentos, ambientes e caixilhos
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="structure">Estrutura</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Carregar Proposta</CardTitle>
                <CardDescription>
                  Arraste um PDF ou clique para selecionar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Drag and Drop Area */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-sm font-medium text-foreground mb-2">
                    Arraste o PDF aqui ou clique para selecionar
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Apenas arquivos PDF são aceitos
                  </p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pdf-input"
                  />
                  <label htmlFor="pdf-input">
                    <Button variant="outline" asChild>
                      <span>Selecionar Arquivo</span>
                    </Button>
                  </label>
                </div>

                {/* Selected File Info */}
                {selectedFile && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <div className="flex-1">
                        <p className="font-medium text-blue-900">{selectedFile.name}</p>
                        <p className="text-sm text-blue-700">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {uploadError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                {/* Success Alert */}
                {uploadSuccess && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      PDF importado com sucesso! Estrutura criada automaticamente.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Upload Button */}
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || importMutation.isPending}
                  className="w-full"
                >
                  {isUploading || importMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Importar PDF"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Structure Tab */}
          <TabsContent value="structure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Estrutura da Obra</CardTitle>
                <CardDescription>
                  Pavimentos, ambientes e caixilhos criados automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                {floorsQuery.isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : floorsQuery.data && floorsQuery.data.length > 0 ? (
                  <div className="space-y-4">
                    {floorsQuery.data.map((floor: any) => (
                      <FloorCard key={floor.id} floor={floor} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum pavimento criado ainda. Importe um PDF para começar.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Importações</CardTitle>
                <CardDescription>
                  Todas as importações de PDF realizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {importsQuery.isLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : importsQuery.data && importsQuery.data.length > 0 ? (
                  <div className="space-y-2">
                    {importsQuery.data.map((imp: any) => (
                      <div
                        key={imp.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{imp.pdfFileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(imp.createdAt).toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {imp.floorsCreated} pavimentos, {imp.roomsCreated} ambientes,{" "}
                            {imp.caixilhosCreated} caixilhos
                          </p>
                          <p className={`text-xs ${
                            imp.status === "completed"
                              ? "text-green-600"
                              : imp.status === "failed"
                              ? "text-red-600"
                              : "text-yellow-600"
                          }`}>
                            {imp.status === "completed"
                              ? "✓ Concluído"
                              : imp.status === "failed"
                              ? "✗ Erro"
                              : "⏳ Processando"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhuma importação realizada ainda.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente para exibir um pavimento com seus ambientes e caixilhos
function FloorCard({ floor }: { floor: any }) {
  const [expanded, setExpanded] = useState(false);
  const roomsQuery = trpc.pdf.getRooms.useQuery({ floorId: floor.id });

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-accent transition-colors"
      >
        <div className="text-left">
          <h3 className="font-semibold">{floor.name}</h3>
          <p className="text-sm text-muted-foreground">
            Pavimento {floor.floorNumber}
          </p>
        </div>
        <span className="text-muted-foreground">
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="bg-muted/50 p-4 space-y-2 border-t">
          {roomsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Carregando ambientes...</p>
          ) : roomsQuery.data && roomsQuery.data.length > 0 ? (
            roomsQuery.data.map((room: any) => (
              <RoomCard key={room.id} room={room} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum ambiente neste pavimento</p>
          )}
        </div>
      )}
    </div>
  );
}

// Componente para exibir um ambiente com seus caixilhos
function RoomCard({ room }: { room: any }) {
  const [expanded, setExpanded] = useState(false);
  const caixilhosQuery = trpc.pdf.getCaixilhos.useQuery({ roomId: room.id });

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-accent transition-colors text-sm"
      >
        <div className="text-left">
          <h4 className="font-medium">{room.name}</h4>
        </div>
        <span className="text-muted-foreground text-xs">
          {expanded ? "▼" : "▶"}
        </span>
      </button>

      {expanded && (
        <div className="bg-muted/30 p-3 space-y-1 border-t text-xs">
          {caixilhosQuery.isLoading ? (
            <p className="text-muted-foreground">Carregando caixilhos...</p>
          ) : caixilhosQuery.data && caixilhosQuery.data.length > 0 ? (
            caixilhosQuery.data.map((caixilho: any) => (
              <div key={caixilho.id} className="p-2 bg-white rounded border">
                <p className="font-medium">{caixilho.code} - {caixilho.type}</p>
                <p className="text-muted-foreground">
                  {caixilho.quantity}x | {caixilho.width}mm x {caixilho.height}mm | {caixilho.weight}kg
                </p>
                {caixilho.description && (
                  <p className="text-muted-foreground">{caixilho.description}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-muted-foreground">Nenhum caixilho neste ambiente</p>
          )}
        </div>
      )}
    </div>
  );
}
