import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Camera, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ResponsiblePhotoPadProps {
  value?: string;
  onChange: (photoUrl: string) => void;
  label: string;
  onPhotoUpload?: (file: File) => Promise<string>;
}

export function ResponsiblePhotoPad({ 
  value, 
  onChange, 
  label,
  onPhotoUpload 
}: ResponsiblePhotoPadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCamera, setIsCamera] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma imagem válida",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (onPhotoUpload) {
        const photoUrl = await onPhotoUpload(file);
        onChange(photoUrl);
        toast({
          title: "Sucesso",
          description: "Foto do responsável enviada com sucesso",
        });
      } else {
        // Fallback: usar FileReader para converter em data URL
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string;
          onChange(dataUrl);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao fazer upload da foto",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCamera(true);
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL("image/jpeg");
        onChange(dataUrl);
        stopCamera();
        toast({
          title: "Sucesso",
          description: "Foto capturada com sucesso",
        });
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach((track) => track.stop());
    }
    setIsCamera(false);
  };

  const handleClear = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Camera className="h-4 w-4" />
        {label}
      </label>
      <Card className="p-4 bg-white">
        {value && !isCamera ? (
          <div className="space-y-3">
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50">
              <img
                src={value}
                alt="Foto do responsável"
                className="w-full h-auto object-cover max-h-64"
              />
            </div>
            <p className="text-xs text-green-600 font-medium">
              ✓ Foto do responsável adicionada
            </p>
          </div>
        ) : isCamera ? (
          <div className="space-y-3">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-black rounded-lg object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={capturePhoto}
                className="flex-1 gap-2"
              >
                <Camera className="h-4 w-4" />
                Capturar Foto
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={stopCamera}
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center space-y-3">
            <Upload className="h-8 w-8 mx-auto text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700">
                Adicione uma foto do responsável
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG ou GIF (máximo 5MB)
              </p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {isLoading ? "Enviando..." : "Selecionar Foto"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startCamera}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                Câmera
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {value && (
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Remover Foto
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
