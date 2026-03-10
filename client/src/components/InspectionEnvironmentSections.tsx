import { EnvironmentSection } from "./EnvironmentSection";
import { trpc } from "@/lib/trpc";

interface InspectionEnvironmentSectionsProps {
  inspectionEnvironmentId: number;
}

export function InspectionEnvironmentSections({ inspectionEnvironmentId }: InspectionEnvironmentSectionsProps) {
  // Apenas as seções necessárias: Atividades, Ocorrências e Comentários
  const activityItemsQuery = trpc.activityItems.list.useQuery(
    { inspectionEnvironmentId },
    { enabled: !!inspectionEnvironmentId }
  );
  const occurrenceItemsQuery = trpc.occurrenceItems.list.useQuery(
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
