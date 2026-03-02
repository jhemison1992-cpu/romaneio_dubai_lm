import { EnvironmentSection } from "./EnvironmentSection";
import { trpc } from "@/lib/trpc";

interface InspectionEnvironmentSectionsProps {
  inspectionEnvironmentId: number;
}

export function InspectionEnvironmentSections({ inspectionEnvironmentId }: InspectionEnvironmentSectionsProps) {
  // Cada instância do componente chama os hooks na mesma ordem - VÁLIDO!
  const laborItemsQuery = trpc.laborItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const equipmentItemsQuery = trpc.equipmentItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const activityItemsQuery = trpc.activityItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const occurrenceItemsQuery = trpc.occurrenceItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const receivedMaterialItemsQuery = trpc.receivedMaterialItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const usedMaterialItemsQuery = trpc.usedMaterialItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const commentItemsQuery = trpc.commentItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );

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
        items={laborItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.laborItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          laborItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.laborItems.update.mutate({ id, ...data });
          laborItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.laborItems.delete.mutate({ id });
          laborItemsQuery.refetch();
        }}
      />
      <EnvironmentSection
        title="Equipamentos"
        fields={[
          { name: "name", label: "Nome", type: "text", required: true },
          { name: "quantity", label: "Quantidade", type: "text", required: true },
          { name: "hours", label: "Horas de Uso", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={equipmentItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.equipmentItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          equipmentItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.equipmentItems.update.mutate({ id, ...data });
          equipmentItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.equipmentItems.delete.mutate({ id });
          equipmentItemsQuery.refetch();
        }}
      />
      <EnvironmentSection
        title="Atividades"
        fields={[
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "duration", label: "Duração (horas)", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={activityItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.activityItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          activityItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.activityItems.update.mutate({ id, ...data });
          activityItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.activityItems.delete.mutate({ id });
          activityItemsQuery.refetch();
        }}
      />
      <EnvironmentSection
        title="Ocorrências"
        fields={[
          { name: "type", label: "Tipo", type: "text", required: true },
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "resolution", label: "Resolução", type: "textarea" },
        ]}
        items={occurrenceItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.occurrenceItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          occurrenceItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.occurrenceItems.update.mutate({ id, ...data });
          occurrenceItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.occurrenceItems.delete.mutate({ id });
          occurrenceItemsQuery.refetch();
        }}
      />
      <EnvironmentSection
        title="Materiais Recebidos"
        fields={[
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "quantity", label: "Quantidade", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={receivedMaterialItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.receivedMaterialItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          receivedMaterialItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.receivedMaterialItems.update.mutate({ id, ...data });
          receivedMaterialItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.receivedMaterialItems.delete.mutate({ id });
          receivedMaterialItemsQuery.refetch();
        }}
      />
      <EnvironmentSection
        title="Materiais Utilizados"
        fields={[
          { name: "description", label: "Descrição", type: "text", required: true },
          { name: "quantity", label: "Quantidade", type: "text", required: true },
          { name: "notes", label: "Observações", type: "textarea" },
        ]}
        items={usedMaterialItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.usedMaterialItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          usedMaterialItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.usedMaterialItems.update.mutate({ id, ...data });
          usedMaterialItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.usedMaterialItems.delete.mutate({ id });
          usedMaterialItemsQuery.refetch();
        }}
      />
      <EnvironmentSection
        title="Comentários"
        fields={[
          { name: "text", label: "Comentário", type: "textarea", required: true },
        ]}
        items={commentItemsQuery.data ?? []}
        onAdd={async (data) => {
          await trpc.commentItems.create.mutate({
            ...data,
            inspectionEnvironmentId,
          });
          commentItemsQuery.refetch();
        }}
        onEdit={async (id, data) => {
          await trpc.commentItems.update.mutate({ id, ...data });
          commentItemsQuery.refetch();
        }}
        onDelete={async (id) => {
          await trpc.commentItems.delete.mutate({ id });
          commentItemsQuery.refetch();
        }}
      />
    </div>
  );
}
