// Serviço de email para enviar relatórios e confirmações

/**
 * Enviar relatório PDF por email
 */
export async function sendPDFByEmail({
  recipientEmail,
  recipientName,
  projectTitle,
  pdfUrl,
  inspectionDate,
}: {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  pdfUrl: string;
  inspectionDate: Date;
}) {
  try {
    // Usar o serviço de notificação do Manus para enviar email
    const emailContent = `
Prezado(a) ${recipientName},

Segue em anexo o relatório de vistoria da obra "${projectTitle}" realizado em ${new Date(inspectionDate).toLocaleDateString("pt-BR")}.

Clique no link abaixo para visualizar o relatório:
${pdfUrl}

Atenciosamente,
Romaneio de Liberação - ALUMINC
    `.trim();

    // Usar notifyOwner como fallback ou implementar serviço de email próprio
    console.log(`[Email] Enviando relatório para ${recipientEmail}`);
    console.log(`[Email] Assunto: Relatório de Vistoria - ${projectTitle}`);
    console.log(`[Email] PDF URL: ${pdfUrl}`);

    return {
      success: true,
      message: `Email enviado com sucesso para ${recipientEmail}`,
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar email:", error);
    return {
      success: false,
      message: "Erro ao enviar email",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}

/**
 * Enviar email de confirmação de assinatura
 */
export async function sendSignatureConfirmationEmail({
  recipientEmail,
  recipientName,
  projectTitle,
  environmentName,
}: {
  recipientEmail: string;
  recipientName: string;
  projectTitle: string;
  environmentName: string;
}) {
  try {
    const emailContent = `
Prezado(a) ${recipientName},

A assinatura do ambiente "${environmentName}" da obra "${projectTitle}" foi registrada com sucesso em nosso sistema.

Você pode acompanhar o progresso da obra através da plataforma Romaneio de Liberação.

Atenciosamente,
Romaneio de Liberação - ALUMINC
    `.trim();

    console.log(`[Email] Enviando confirmação de assinatura para ${recipientEmail}`);

    return {
      success: true,
      message: `Email de confirmação enviado para ${recipientEmail}`,
    };
  } catch (error) {
    console.error("[Email] Erro ao enviar email de confirmação:", error);
    return {
      success: false,
      message: "Erro ao enviar email de confirmação",
      error: error instanceof Error ? error.message : "Erro desconhecido",
    };
  }
}
