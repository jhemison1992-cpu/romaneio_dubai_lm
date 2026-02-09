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
          await trpc.laborItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          laborItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.laborItems.update.mutate({ id, ...data });
          laborItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.laborItems.delete.mutate({ id });
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
          await trpc.equipmentItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          equipmentItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.equipmentItems.update.mutate({ id, ...data });
          equipmentItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.equipmentItems.delete.mutate({ id });
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
          await trpc.activityItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          activityItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.activityItems.update.mutate({ id, ...data });
          activityItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.activityItems.delete.mutate({ id });
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
          await trpc.occurrenceItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          occurrenceItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.occurrenceItems.update.mutate({ id, ...data });
          occurrenceItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.occurrenceItems.delete.mutate({ id });
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
          await trpc.receivedMaterialItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          receivedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.receivedMaterialItems.update.mutate({ id, ...data });
          receivedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.receivedMaterialItems.delete.mutate({ id });
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
          await trpc.usedMaterialItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          usedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.usedMaterialItems.update.mutate({ id, ...data });
          usedMaterialItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.usedMaterialItems.delete.mutate({ id });
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
          await trpc.commentItems.create.mutate({
            ...data,
            inspectionEnvironmentId: environmentId,
          });
          commentItemsQueries[envIndex]?.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.commentItems.update.mutate({ id, ...data });
          commentItemsQueries[envIndex]?.refetch();
        }}
        onDelete={async (id) => {
          await trpc.commentItems.delete.mutate({ id });
          commentItemsQueries[envIndex]?.refetch();
        }}
      />
    </div>
  );
};
