// Mapeamento entre códigos de caixilhos e arquivos PDF das plantas técnicas
export const plantasMapping: Record<string, string> = {
  "AL 008 (CA08)": "/plantas/01-AL008(CA8)-PISCINACOBERTA_R02.pdf",
  "AL 010 (CA10)": "/plantas/02-AL010(CA10)-PISCINACOBERTA_R02.pdf",
  "AL 011 (CA12)": "/plantas/03-AL011(CA12)-ENTRADASOCIAL_R02.pdf",
  "AL 012 (CA13)": "/plantas/04-AL012(CA13)-ENTRADASERVIÇO_R02.pdf",
  "AL 015 (PA3)": "/plantas/05-AL015(PA3)-ABRIGODEGÁS_R02.pdf",
  "AL 019 (PB4)": "/plantas/07-AL019(PB4)-SALÃODEFESTAS_R02.pdf", // Usado para Salão de Festas e SPA
  "AL 023 (VN7)": "/plantas/09-AL023(VN7)-AQUECEDORPISCINA_R02.pdf",
  "AL 024 (VN8)": "/plantas/10-AL024(VN8)-AQUECEDORPISCINA_R02.pdf",
  "AL 027 (VN11)": "/plantas/11-AL027(VN11)-RESERVATORIOS_R02.pdf",
  "AL 029 (PA4)": "/plantas/12-AL029(PA4)-SAUNA_R02.pdf",
  "AL 034 (PA6)": "/plantas/13-AL034(PA6)-SHAFT_R02.pdf",
};

export function getPlantaUrl(caixilhoCode: string): string | null {
  return plantasMapping[caixilhoCode] || null;
}
