import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Camera, Image as ImageIcon, Pencil, Save, Trash2, Video, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

interface MediaUploadProps {
  inspectionItemId: number | undefined;
  onUploadComplete?: () => void;
}

export function MediaUpload({ inspectionItemId, onUploadComplete }: MediaUploadProps) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewType, setPreviewType] = useState<"photo" | "video">("photo");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [mediaToDelete, setMediaToDelete] = useState<number | null>(null);
  
  const photoInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoCameraInputRef = useRef<HTMLInputElement>(null);
  
  const utils = trpc.useUtils();
  
  const { data: mediaFiles, refetch } = trpc.media.list.useQuery(
    { inspectionItemId: inspectionItemId! },
    { enabled: !!inspectionItemId }
  );
  
  const uploadMutation = trpc.media.upload.useMutation({
    onSuccess: () => {
      toast.success("Arquivo enviado com sucesso!");
      refetch();
      onUploadComplete?.();
    },
    onError: (error) => {
      toast.error("Erro ao enviar arquivo: " + error.message);
    },
  });
  
  const updateCommentMutation = trpc.media.updateComment.useMutation({
    onSuccess: () => {
      toast.success("Comentário atualizado!");
      refetch();
      setEditingCommentId(null);
    },
    onError: (error) => {
      toast.error("Erro ao atualizar comentário: " + error.message);
    },
  });
  
  const deleteMutation = trpc.media.delete.useMutation({
    onSuccess: () => {
      toast.success("Arquivo excluído!");
      refetch();
      setMediaToDelete(null);
    },
    onError: (error) => {
      toast.error("Erro ao excluir: " + error.message);
    },
  });
  
  const handleFileSelect = async (file: File, mediaType: "photo" | "video") => {
    if (!inspectionItemId) {
      toast.error("Por favor, salve os dados do ambiente antes de adicionar mídias");
      return;
    }
    
    const maxSize = mediaType === "photo" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`Arquivo muito grande. Máximo: ${mediaType === "photo" ? "10MB" : "50MB"}`);
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];
      
      if (!base64Data) {
        toast.error("Erro ao processar arquivo");
        return;
      }
      
      uploadMutation.mutate({
        inspectionItemId,
        fileData: base64Data,
        fileName: file.name,
        mimeType: file.type,
        mediaType,
      });
    };
    reader.readAsDataURL(file);
  };
  
  const handlePreview = (url: string, type: "photo" | "video") => {
    setPreviewUrl(url);
    setPreviewType(type);
    setPreviewOpen(true);
  };
  
  const handleDelete = (id: number) => {
    setMediaToDelete(id);
  };
  
  const confirmDelete = () => {
    if (mediaToDelete !== null) {
      deleteMutation.mutate({ id: mediaToDelete });
    }
  };

  const handleEditComment = (id: number, currentComment: string | null) => {
    setEditingCommentId(id);
    setEditingCommentText(currentComment || "");
  };

  const handleSaveComment = (id: number) => {
    updateCommentMutation.mutate({ id, comment: editingCommentText });
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const photos = mediaFiles?.filter((f) => f.mediaType === "photo") || [];
  const videos = mediaFiles?.filter((f) => f.mediaType === "video") || [];

  return (
    <div className="space-y-6">
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, "photo");
          e.target.value = "";
        }}
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, "video");
          e.target.value = "";
        }}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, "photo");
          e.target.value = "";
        }}
      />
      <input
        ref={videoCameraInputRef}
        type="file"
        accept="video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file, "video");
          e.target.value = "";
        }}
      />
      
      <div className="grid gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => cameraInputRef.current?.click()}
          disabled={!inspectionItemId || uploadMutation.isPending}
        >
          <Camera className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Tirar Foto</div>
            <div className="text-xs text-muted-foreground">Usar câmera do dispositivo</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => photoInputRef.current?.click()}
          disabled={!inspectionItemId || uploadMutation.isPending}
        >
          <ImageIcon className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Selecionar Foto</div>
            <div className="text-xs text-muted-foreground">Escolher da galeria</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => videoCameraInputRef.current?.click()}
          disabled={!inspectionItemId || uploadMutation.isPending}
        >
          <Camera className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Gravar Vídeo</div>
            <div className="text-xs text-muted-foreground">Usar câmera do dispositivo</div>
          </div>
        </Button>
        
        <Button
          variant="outline"
          className="gap-2 h-auto py-4"
          onClick={() => videoInputRef.current?.click()}
          disabled={!inspectionItemId || uploadMutation.isPending}
        >
          <Video className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Selecionar Vídeo</div>
            <div className="text-xs text-muted-foreground">Escolher da galeria</div>
          </div>
        </Button>
      </div>
      
      {uploadMutation.isPending && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
        </div>
      )}
      
      {photos.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Fotos ({photos.length})</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden">
                <div className="relative group">
                  <img
                    src={photo.fileUrl}
                    alt={photo.fileName}
                    className="w-full h-48 object-cover cursor-pointer"
                    onClick={() => handlePreview(photo.fileUrl, "photo")}
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                    onClick={() => handleDelete(photo.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-3 space-y-2">
                  {editingCommentId === photo.id ? (
                    <div className="flex gap-2">
                      <Input
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        placeholder="Adicione um comentário..."
                        className="flex-1"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="default"
                        onClick={() => handleSaveComment(photo.id)}
                        disabled={updateCommentMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <p className="text-sm text-muted-foreground flex-1 min-h-[24px]">
                        {photo.comment || "Sem comentário"}
                      </p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => handleEditComment(photo.id, photo.comment)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {videos.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Vídeos ({videos.length})</h4>
          <div className="grid gap-3">
            {videos.map((video) => (
              <Card key={video.id} className="p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Video className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{video.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {(video.fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePreview(video.fileUrl, "video")}
                    >
                      Ver
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDelete(video.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {editingCommentId === video.id ? (
                  <div className="flex gap-2">
                    <Input
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      placeholder="Adicione um comentário..."
                      className="flex-1"
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="default"
                      onClick={() => handleSaveComment(video.id)}
                      disabled={updateCommentMutation.isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={handleCancelEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-muted-foreground flex-1 min-h-[24px]">
                      {video.comment || "Sem comentário"}
                    </p>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleEditComment(video.id, video.comment)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {!inspectionItemId && (
        <Card className="p-4 bg-muted/50">
          <p className="text-sm text-muted-foreground text-center">
            Salve os dados do ambiente primeiro para adicionar fotos e vídeos
          </p>
        </Card>
      )}
      
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Visualização</DialogTitle>
          </DialogHeader>
          <div className="relative">
            {previewType === "photo" ? (
              <img src={previewUrl} alt="Preview" className="w-full h-auto" />
            ) : (
              <video src={previewUrl} controls className="w-full h-auto" />
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={mediaToDelete !== null} onOpenChange={(open) => !open && setMediaToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta mídia? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
