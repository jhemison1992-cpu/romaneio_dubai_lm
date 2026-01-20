import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Pen } from "lucide-react";

interface SignaturePadProps {
  value?: string;
  onChange: (signature: string) => void;
  label: string;
}

export function SignaturePad({ value, onChange, label }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (value && sigCanvas.current) {
      try {
        sigCanvas.current.fromDataURL(value);
      } catch (error) {
        console.warn('Erro ao carregar assinatura:', error);
      }
    }
  }, [value]);

  const handleClear = () => {
    sigCanvas.current?.clear();
    onChange("");
  };

  const handleEnd = () => {
    if (sigCanvas.current) {
      const dataURL = sigCanvas.current.toDataURL();
      onChange(dataURL);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium flex items-center gap-2">
        <Pen className="h-4 w-4" />
        {label}
      </label>
      <Card className="p-4 bg-white">
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigCanvas}
            canvasProps={{
              className: "w-full h-32 touch-action-none",
              style: { touchAction: "none" }
            }}
            onEnd={handleEnd}
          />
        </div>
        <div className="mt-3 flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Assine usando o dedo ou stylus
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Limpar
          </Button>
        </div>
      </Card>
    </div>
  );
}
