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
          try {
            const createMutation = trpc.laborItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            laborItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar mao de obra:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.laborItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            laborItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar mao de obra:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.laborItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            laborItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar mao de obra:', e);
          }
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
          try {
            const createMutation = trpc.equipmentItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            equipmentItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar equipamento:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.equipmentItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            equipmentItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar equipamento:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.equipmentItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            equipmentItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar equipamento:', e);
          }
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
          try {
            const createMutation = trpc.activityItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            activityItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar atividade:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.activityItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            activityItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar atividade:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.activityItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            activityItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar atividade:', e);
          }
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
          try {
            const createMutation = trpc.occurrenceItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            occurrenceItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar ocorrencia:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.occurrenceItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            occurrenceItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar ocorrencia:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.occurrenceItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            occurrenceItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar ocorrencia:', e);
          }
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
          try {
            const createMutation = trpc.receivedMaterialItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            receivedMaterialItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar material recebido:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.receivedMaterialItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            receivedMaterialItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar material recebido:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.receivedMaterialItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            receivedMaterialItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar material recebido:', e);
          }
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
          try {
            const createMutation = trpc.usedMaterialItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            usedMaterialItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar material:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.usedMaterialItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            usedMaterialItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar material:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.usedMaterialItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            usedMaterialItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar material:', e);
          }
        }}
      />
      <EnvironmentSection
        title="Comentários"
        fields={[
          { name: "text", label: "Comentário", type: "textarea", required: true },
        ]}
        items={commentItemsQuery.data ?? []}
        onAdd={async (data) => {
          try {
            const createMutation = trpc.commentItems.create.useMutation();
            await createMutation.mutateAsync({
              ...data,
              inspectionEnvironmentId,
            });
            commentItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao adicionar comentario:', e);
          }
        }}
        onEdit={async (id, data) => {
          try {
            const updateMutation = trpc.commentItems.update.useMutation();
            await updateMutation.mutateAsync({ id, ...data });
            commentItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao editar comentario:', e);
          }
        }}
        onDelete={async (id) => {
          try {
            const deleteMutation = trpc.commentItems.delete.useMutation();
            await deleteMutation.mutateAsync({ id });
            commentItemsQuery.refetch();
          } catch (e) {
            console.error('Erro ao deletar comentario:', e);
          }
        }}
      />
    </div>
  );
}
