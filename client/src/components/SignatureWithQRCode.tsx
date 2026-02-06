import { useRef, useEffect, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { X, Pen } from "lucide-react";
import QRCode from "qrcode.react";

interface SignatureWithQRCodeProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
  responsibleName: string;
  environmentName: string;
  releaseDate?: string;
}

export function SignatureWithQRCode({
  isOpen,
  onClose,
  onSave,
  responsibleName,
  environmentName,
  releaseDate,
}: SignatureWithQRCodeProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [signature, setSignature] = useState("");
  const qrRef = useRef<HTMLDivElement>(null);

  // Gerar dados para o QR Code
  const qrData = JSON.stringify({
    name: responsibleName,
    environment: environmentName,
    date: releaseDate || new Date().toISOString().split("T")[0],
    timestamp: new Date().toISOString(),
  });

  const handleClear = () => {
    sigCanvas.current?.clear();
    setSignature("");
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL();
      setSignature(dataURL);
    }
  };

  const handleSave = () => {
    if (signature) {
      onSave(signature);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Assinatura do Responsável</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6 py-4">
          {/* Lado Esquerdo: QR Code e Informações */}
          <div className="flex flex-col items-center justify-center space-y-4 border-r pr-6">
            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-600">Responsável</p>
              <p className="text-lg font-semibold text-gray-900">{responsibleName}</p>
            </div>

            <div className="text-center space-y-2">
              <p className="text-sm font-medium text-gray-600">Ambiente</p>
              <p className="text-base text-gray-700">{environmentName}</p>
            </div>

            {releaseDate && (
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-gray-600">Data de Liberação</p>
                <p className="text-base text-gray-700">{releaseDate}</p>
              </div>
            )}

            <div className="border-t pt-4 mt-4">
              <p className="text-xs text-gray-500 mb-3">Código de Verificação</p>
              <div ref={qrRef} className="flex justify-center">
                <QRCode
                  value={qrData}
                  size={150}
                  level="H"
                  includeMargin={true}
                  renderAs="canvas"
                />
              </div>
            </div>

            <div className="text-xs text-gray-400 text-center mt-2">
              <p>Escaneie para verificar</p>
              <p>os dados da assinatura</p>
            </div>
          </div>

          {/* Lado Direito: Área de Assinatura */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center gap-2">
              <Pen className="h-4 w-4 text-blue-600" />
              <label className="text-sm font-medium">Assine aqui</label>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
              <SignatureCanvas
                ref={sigCanvas}
                canvasProps={{
                  className: "w-full h-64 touch-action-none cursor-crosshair",
                  style: { touchAction: "none" },
                }}
                onEnd={handleEnd}
              />
            </div>

            <p className="text-xs text-gray-500">
              Use o dedo ou stylus para assinar na área acima
            </p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClear}
              className="gap-2 w-full"
            >
              <X className="h-4 w-4" />
              Limpar Assinatura
            </Button>

            {signature && (
              <div className="bg-green-50 border border-green-200 rounded p-2">
                <p className="text-xs text-green-700 font-medium">
                  ✓ Assinatura capturada com sucesso
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!signature}
            className="gap-2"
          >
            <Pen className="h-4 w-4" />
            Confirmar Assinatura
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
