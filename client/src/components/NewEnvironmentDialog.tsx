import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

interface NewEnvironmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  onNameChange: (value: string) => void;
  code: string;
  onCodeChange: (value: string) => void;
  type: string;
  onTypeChange: (value: string) => void;
  quantity: number;
  onQuantityChange: (value: number) => void;
  plantaFile: File | null;
  onPlantaFileChange: (file: File | null) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function NewEnvironmentDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  code,
  onCodeChange,
  type,
  onTypeChange,
  quantity,
  onQuantityChange,
  plantaFile,
  onPlantaFileChange,
  onSubmit,
  isSubmitting,
}: NewEnvironmentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Ambiente</DialogTitle>
          <DialogDescription>
            Preencha os dados do ambiente e faça upload da planta técnica (opcional)
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="envName">Nome do Ambiente *</Label>
            <Input
              id="envName"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Ex: Sala 101"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="envCode">Código do Caixilho *</Label>
              <Input
                id="envCode"
                value={code}
                onChange={(e) => onCodeChange(e.target.value)}
                placeholder="Ex: J01"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="envQty">Quantidade *</Label>
              <Input
                id="envQty"
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="envType">Tipo do Caixilho *</Label>
            <Input
              id="envType"
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              placeholder="Ex: Janela de Correr"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="envPlanta">Planta Técnica (opcional)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="envPlanta"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => onPlantaFileChange(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {plantaFile && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onPlantaFileChange(null)}
                >
                  Remover
                </Button>
              )}
            </div>
            {plantaFile && (
              <p className="text-sm text-muted-foreground">
                <Upload className="inline h-3 w-3 mr-1" />
                {plantaFile.name}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Adicionando..." : "Adicionar Ambiente"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
