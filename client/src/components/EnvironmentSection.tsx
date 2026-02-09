import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

export interface SectionItem {
  id?: number;
  [key: string]: any;
}

export interface SectionConfig {
  title: string;
  fields: {
    name: string;
    label: string;
    type: "text" | "textarea" | "number";
    required?: boolean;
  }[];
  onAdd: (data: any) => Promise<void>;
  onEdit: (id: number, data: any) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  items: SectionItem[];
  isLoading?: boolean;
}

export const EnvironmentSection: React.FC<SectionConfig> = ({
  title,
  fields,
  onAdd,
  onEdit,
  onDelete,
  items,
  isLoading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleOpenDialog = (item?: SectionItem) => {
    if (item) {
      setEditingId(item.id || null);
      setFormData(item);
    } else {
      setEditingId(null);
      setFormData({});
    }
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await onEdit(editingId, formData);
        toast.success("Item atualizado com sucesso");
      } else {
        await onAdd(formData);
        toast.success("Item adicionado com sucesso");
      }
      setIsOpen(false);
      setFormData({});
    } catch (error) {
      toast.error("Erro ao salvar item");
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir este item?")) {
      try {
        await onDelete(id);
        toast.success("Item excluído com sucesso");
      } catch (error) {
        toast.error("Erro ao excluir item");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-orange-600">{title}</h3>
        <Button
          onClick={() => handleOpenDialog()}
          size="sm"
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhum item adicionado</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <Card key={item.id} className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <p className="font-medium">
                  {fields.map((f) => item[f.name]).filter(Boolean).join(" - ")}
                </p>
                {item.notes && <p className="text-sm text-gray-600">{item.notes}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleOpenDialog(item)}
                  size="sm"
                  variant="outline"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => handleDelete(item.id!)}
                  size="sm"
                  variant="destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Editar ${title}` : `Adicionar ${title}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map((field) => (
              <div key={field.name}>
                <label className="block text-sm font-medium mb-1">
                  {field.label} {field.required && "*"}
                </label>
                {field.type === "textarea" ? (
                  <Textarea
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: e.target.value })
                    }
                    required={field.required}
                  />
                ) : (
                  <Input
                    type={field.type}
                    value={formData[field.name] || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [field.name]:
                          field.type === "number"
                            ? parseFloat(e.target.value)
                            : e.target.value,
                      })
                    }
                    required={field.required}
                  />
                )}
              </div>
            ))}
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
