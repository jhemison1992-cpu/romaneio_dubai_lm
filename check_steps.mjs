import { db } from "./server/db.ts";
import { installationSteps, inspectionItems } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const items = await db.select().from(inspectionItems);

console.log("\n=== VERIFICAÇÃO DE ETAPAS POR AMBIENTE ===\n");

for (const item of items) {
  const steps = await db
    .select()
    .from(installationSteps)
    .where(eq(installationSteps.inspectionItemId, item.id))
    .orderBy(installationSteps.stepOrder);
  
  console.log(`Ambiente: ${item.environmentName}`);
  console.log(`ID do item: ${item.id}`);
  console.log(`Quantidade de etapas: ${steps.length}`);
  
  if (steps.length > 0) {
    console.log("Etapas encontradas:");
    steps.forEach((step, idx) => {
      console.log(`  ${idx + 1}. ID: ${step.id}, Order: ${step.stepOrder}, Nome: ${step.stepName}`);
    });
  }
  console.log("---\n");
}

process.exit(0);
