import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RotateCcw, Check } from 'lucide-react';

interface SignatureCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onSignatureCapture: (signatureData: {
    signatureImage: string;
    signerName: string;
    signerRole: string;
    timestamp: string;
    documentHash: string;
  }) => void;
  documentHash?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  isOpen,
  onClose,
  onSignatureCapture,
  documentHash = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState('');
  const [signerRole, setSignerRole] = useState('');
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = canvas.toDataURL('image/png');
      // Verifica se há conteúdo na assinatura
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let hasContent = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] > 128) {
            hasContent = true;
            break;
          }
        }
        setHasSignature(hasContent);
      }
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasSignature(false);
      }
    }
  };

  const handleConfirmSignature = () => {
    if (!signerName.trim()) {
      alert('Por favor, informe o nome do signatário');
      return;
    }

    if (!hasSignature) {
      alert('Por favor, capture a assinatura');
      return;
    }

    const canvas = canvasRef.current;
    if (canvas) {
      const signatureImage = canvas.toDataURL('image/png');
      const timestamp = new Date().toISOString();

      onSignatureCapture({
        signatureImage,
        signerName,
        signerRole,
        timestamp,
        documentHash,
      });

      // Limpar formulário
      setSignerName('');
      setSignerRole('');
      clearSignature();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Capturar Assinatura Digital</DialogTitle>
          <DialogDescription>
            Assine o documento para validação. A assinatura será criptografada e vinculada ao documento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Signatário */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signer-name">Nome do Signatário *</Label>
              <Input
                id="signer-name"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signer-role">Cargo/Função</Label>
              <Input
                id="signer-role"
                value={signerRole}
                onChange={(e) => setSignerRole(e.target.value)}
                placeholder="Ex: Engenheiro Responsável"
              />
            </div>
          </div>

          {/* Canvas para Assinatura */}
          <div className="space-y-2">
            <Label>Área de Assinatura</Label>
            <Card className="p-2">
              <canvas
                ref={canvasRef}
                width={500}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full border-2 border-dashed border-gray-300 rounded cursor-crosshair bg-white"
              />
            </Card>
            <p className="text-xs text-gray-500">
              Assine com o mouse. A assinatura será validada e vinculada ao documento.
            </p>
          </div>

          {/* Informações de Segurança */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Segurança do Documento</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>✓ Assinatura será criptografada</p>
              <p>✓ Hash do documento: {documentHash.substring(0, 16)}...</p>
              <p>✓ Timestamp: {new Date().toLocaleString('pt-BR')}</p>
              <p>✓ Validação de integridade habilitada</p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmSignature}
              disabled={!hasSignature || !signerName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="w-4 h-4 mr-2" />
              Confirmar Assinatura
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
