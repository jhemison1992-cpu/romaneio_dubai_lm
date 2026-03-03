import React from "react";
import { EnvironmentSection } from "@/components/EnvironmentSection";
import { trpc } from "@/lib/trpc";

interface EnvironmentSectionsProps {
  environmentId: number;
  allEnvironments: any[];
  laborItemsQueries: any[];
  equipmentItemsQueries: any[];
  activityItemsQueries: any[];
  occurrenceItemsQueries: any[];
  receivedMaterialItemsQueries: any[];
  usedMaterialItemsQueries: any[];
  commentItemsQueries: any[];
}

export const EnvironmentSections: React.FC<EnvironmentSectionsProps> = ({
  environmentId,
  allEnvironments,
  laborItemsQueries,
  equipmentItemsQueries,
  activityItemsQueries,
  occurrenceItemsQueries,
  receivedMaterialItemsQueries,
  usedMaterialItemsQueries,
  commentItemsQueries,
}) => {
  const envIndex = allEnvironments.findIndex((e) => e.id === environmentId);

  return (
    <div className="border-t pt-6 space-y-6">
      <EnvironmentSection
        title="Mão de Obra"
        fields={[
          { name: "profession", label: "Profissão", type: "text", required: true },
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "hours", label: "Horas", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={laborItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.laborItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          laborItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.laborItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          laborItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.laborItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          laborItemsQueries[envIndex]?.refetch();
        }}
      />

      <EnvironmentSection
        title="Equipamentos"
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "quantity", label: "Quantidade", type: "number", required: true },
          { name: "unit", label: "Unidade", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={equipmentItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.equipmentItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          equipmentItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.equipmentItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          equipmentItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.equipmentItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          equipmentItemsQueries[envIndex]?.refetch();
        }}
      />

      <EnvironmentSection
        title="Atividades"
        fields={[
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "status", label: "Status", type: "text" },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={activityItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.activityItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          activityItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.activityItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          activityItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.activityItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          activityItemsQueries[envIndex]?.refetch();
        }}
      />

      <EnvironmentSection
        title="Ocorrências"
        fields={[
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "severity", label: "Severidade", type: "text" },
          { name: "status", label: "Status", type: "text" },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={occurrenceItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.occurrenceItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          occurrenceItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.occurrenceItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          occurrenceItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.occurrenceItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          occurrenceItemsQueries[envIndex]?.refetch();
        }}
      />

      <EnvironmentSection
        title="Materiais Recebidos"
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "quantity", label: "Quantidade", type: "number", required: true },
          { name: "unit", label: "Unidade", type: "text", required: true },
          { name: "receivedDate", label: "Data de Recebimento", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={receivedMaterialItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.receivedMaterialItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          receivedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.receivedMaterialItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          receivedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.receivedMaterialItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          receivedMaterialItemsQueries[envIndex]?.refetch();
        }}
      />

      <EnvironmentSection
        title="Materiais Utilizados"
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "quantity", label: "Quantidade", type: "number", required: true },
          { name: "unit", label: "Unidade", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={usedMaterialItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.usedMaterialItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          usedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.usedMaterialItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          usedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.usedMaterialItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          usedMaterialItemsQueries[envIndex]?.refetch();
        }}
      />

      <EnvironmentSection
        title="Comentários"
        fields={[
          { name: "author", label: "Autor", type: "text", required: true },
          { name: "content", label: "Comentário", type: "textarea", required: true },
        ]}
        items={commentItemsQueries[envIndex]?.data || []}
        onAdd={async (data) => {
          const createMutation = trpc.commentItems.create.useMutation(); await createMutation.mutateAsync({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          commentItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          const updateMutation = trpc.commentItems.update.useMutation(); await updateMutation.mutateAsync({ id, ...data });
          commentItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          const deleteMutation = trpc.commentItems.delete.useMutation(); await deleteMutation.mutateAsync({ id });
          commentItemsQueries[envIndex]?.refetch();
        }}
      />
    </div>
  );
};
