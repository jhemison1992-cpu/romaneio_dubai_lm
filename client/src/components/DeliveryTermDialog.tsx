import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignaturePad } from "@/components/SignaturePad";
import { FileText } from "lucide-react";

interface DeliveryTermDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  environmentName: string;
  responsibleName: string;
  onResponsibleNameChange: (value: string) => void;
  signature: string;
  onSignatureChange: (value: string) => void;
  onSave: () => void;
  onGeneratePDF: () => void;
  isSaving: boolean;
}

export function DeliveryTermDialog({
  open,
  onOpenChange,
  environmentName,
  responsibleName,
  onResponsibleNameChange,
  signature,
  onSignatureChange,
  onSave,
  onGeneratePDF,
  isSaving,
}: DeliveryTermDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Termo de Entrega - {environmentName}</DialogTitle>
          <DialogDescription>
            Preencha os dados do responsável e assine o termo de entrega da instalação
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Declaração de Entrega</h4>
            <p className="text-sm text-muted-foreground">
              Declaro que recebi a instalação do caixilho no ambiente <strong>{environmentName}</strong> em
              perfeitas condições de funcionamento, com todos os acabamentos concluídos conforme especificado
              no projeto. A instalação foi realizada pela empresa ALUMINC Esquadrias Metálicas.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="responsible">Nome do Responsável *</Label>
            <Input
              id="responsible"
              value={responsibleName}
              onChange={(e) => onResponsibleNameChange(e.target.value)}
              placeholder="Nome completo do responsável"
            />
          </div>

          <div className="space-y-2">
            <SignaturePad
              label="Assinatura do Responsável *"
              value={signature}
              onChange={onSignatureChange}
            />
          </div>
        </div>
        
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button 
            variant="outline" 
            onClick={onGeneratePDF}
            disabled={!signature || !responsibleName.trim()}
          >
            <FileText className="mr-2 h-4 w-4" />
            Gerar PDF
          </Button>
          <Button 
            onClick={onSave} 
            disabled={isSaving || !signature || !responsibleName.trim()}
          >
            {isSaving ? "Salvando..." : "Salvar Termo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
