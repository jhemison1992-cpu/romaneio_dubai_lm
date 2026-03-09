import { db } from './server/db.ts';
import { environments, windows } from './drizzle/schema.ts';

// Dados extraídos do PDF ALU-0181-24_PROD2.pdf
const projectId = 90001; // DUBAI LM

// Estrutura de pavimentos e ambientes
const floorsData = [
  {
    name: 'ÁTRIO',
    environments: [
      { name: 'SUÍTES', code: 'SUITE' },
      { name: 'DORMITÓRIOS 2', code: 'DORM2' },
      { name: 'DORMITÓRIOS 3', code: 'DORM3' },
      { name: 'BANHO 01 E 02', code: 'BANHO' },
      { name: 'ÁREA DE SERVIÇO', code: 'SERV' },
      { name: 'TERRAÇO', code: 'TERR' },
    ]
  },
  {
    name: '1º AO 28º PAVIMENTO',
    environments: [
      { name: 'SUÍTES', code: 'SUITE' },
      { name: 'DORMITÓRIOS 2', code: 'DORM2' },
      { name: 'DORMITÓRIOS 3', code: 'DORM3' },
      { name: 'BANHO 01 E 02', code: 'BANHO' },
      { name: 'ÁREA DE SERVIÇO', code: 'SERV' },
      { name: 'TERRAÇO', code: 'TERR' },
    ]
  },
  {
    name: '29º PAVIMENTO',
    environments: [
      { name: 'SUÍTES', code: 'SUITE' },
      { name: 'DORMITÓRIOS 3', code: 'DORM3' },
      { name: 'BANHO 01 E 02', code: 'BANHO' },
    ]
  }
];

// Dados dos caixilhos extraídos do PDF
const windowsData = [
  {
    code: 'AL-001',
    type: 'JANELA INTEGRADA DE CORRER 2 FOLHAS COM PEITORIL',
    description: 'Janela integrada de correr 2 folhas com peitoril, recolhedor de fita - Linha ALU-25',
    width: 1376,
    height: 1316,
    material: 'Alumínio',
    glassType: 'Vidro comum float liso 4mm incolor lapidado',
    quantity: 169,
    weight: 3445.481,
    location: 'SUÍTES - ÁTRIO - 1º AO 29º PAV.',
    observations: 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1ºAO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6. / FINAL 29º PAVIMENTO: 3.'
  },
  {
    code: 'AL-002',
    type: 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE',
    description: 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20',
    width: 1376,
    height: 1026,
    material: 'Alumínio',
    glassType: 'Vidro comum float liso 4mm incolor lapidado',
    quantity: 113,
    weight: 1543.682,
    location: 'DORMITÓRIOS 2 - ÁTRIO - 1º AO 28º PAV.',
    observations: 'FINAIS ÁTRIO: 2 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 4 E 5.'
  },
  {
    code: 'AL-003',
    type: 'JANELA INTEGRADA DE CORRER - 2 FOLHA SEM BAGUETE',
    description: 'Janela integrada de correr 2 folhas sem baguete - Linha ALU-20',
    width: 1176,
    height: 1046,
    material: 'Alumínio',
    glassType: 'Vidro comum float liso 4mm incolor lapidado',
    quantity: 168,
    weight: 2094.616,
    location: 'DORMITÓRIOS 3 - ÁTRIO - 1º AO 28º PAV.',
    observations: 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6'
  },
  {
    code: 'AL-004',
    type: 'MAXIM-AR 1 FOLHA(S)',
    description: 'Maxim-ar 1 folha - Linha ALU-25 sem baguete',
    width: 576,
    height: 716,
    material: 'Alumínio',
    glassType: 'Vidro comum fantasia mini boreal 4mm incolor',
    quantity: 255,
    weight: 657.503,
    location: 'BANHO 01 E 02 - ÁTRIO - 1º AO 29º PAV.',
    observations: 'FINAIS ÁTRIO: 2, 3, 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, E 5. / FINAIS 29º PAVIMENTO: 3.'
  },
  {
    code: 'AL-006',
    type: 'JANELA GUILHOTINA 2 FOLHAS',
    description: 'Janela guilhotina 2 folhas (1 folha móvel - 1 folha fixa) - Linha ALU-25',
    width: 536,
    height: 636,
    material: 'Alumínio',
    glassType: 'Vidro comum float liso 4mm incolor lapidado',
    quantity: 141,
    weight: 484.361,
    location: 'ÁREA DE SERVIÇO - ÁTRIO - 1º AO 28º PAV.',
    observations: 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º: 1, 2, 3, 4 E 5'
  },
  {
    code: 'AL-007',
    type: 'JANELA DE CORRER - 2 FOLHA COM BANDEIRA VENTILADA',
    description: 'Janela de correr 2 folhas sem baguete com bandeira ventilada - Linha SP 20',
    width: 1076,
    height: 1046,
    material: 'Alumínio',
    glassType: 'Vidro comum float liso 4mm incolor lapidado',
    quantity: 141,
    weight: 799.581,
    location: 'ÁREA DE SERVIÇO - ÁTRIO - 1º AO 28º PAV.',
    observations: 'FINAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4 E 5.'
  },
  {
    code: 'AL-016',
    type: 'PORTA DE CORRER - 2 FOLHA SEM BAGUETE',
    description: 'Porta de correr 2 folhas sem baguete - Linha SP 20',
    width: 1686,
    height: 2151,
    material: 'Alumínio',
    glassType: 'Vidro temperado float liso 6mm incolor / Vidro comum float liso 4mm incolor lapidado',
    quantity: 168,
    weight: 2327.897,
    location: 'TERRAÇO - ÁTRIO - 1º AO 28º PAV.',
    observations: 'FINAIS ÁTRIO: 2, 3 E 4 / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4, 5 E 6.'
  },
  {
    code: 'AL-020',
    type: 'VENTILAÇÃO PERMANENTE DV-113 COM ABA',
    description: 'Ventilação permanente DV-113 com aba - Linha 25',
    width: 650,
    height: 760,
    material: 'Alumínio',
    glassType: 'Ventilação',
    quantity: 141,
    weight: 623.992,
    location: 'ÁREA DE SERVIÇO - ÁTRIO - 1º AO 28º PAV.',
    observations: 'FNAIS ÁTRIO: 2, 3 E 4. / FINAIS 1º AO 28º PAVIMENTO: 1, 2, 3, 4 E 5.'
  }
];

async function seedData() {
  try {
    console.log('🚀 Iniciando importação de dados do PDF...\n');

    let environmentCount = 0;
    let windowCount = 0;

    // Para cada pavimento
    for (const floor of floorsData) {
      console.log(`📍 Processando pavimento: ${floor.name}`);

      // Para cada ambiente no pavimento
      for (const env of floor.environments) {
        try {
          // Criar ambiente
          const [environmentId] = await db.insert(environments).values({
            projectId,
            name: `${env.name} - ${floor.name}`,
            code: env.code,
            floor: floor.name,
            status: 'pending',
            progress: 0,
            notes: `Ambiente criado automaticamente do PDF ALU-0181-24_PROD2`,
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          console.log(`  ✓ Ambiente criado: ${env.name} - ${floor.name}`);
          environmentCount++;

          // Adicionar caixilhos ao ambiente baseado na localização
          for (const windowData of windowsData) {
            if (windowData.location.includes(env.name) && 
                (floor.name === 'ÁTRIO' || 
                 (windowData.location.includes('1º AO 28º') && floor.name === '1º AO 28º PAVIMENTO') ||
                 (windowData.location.includes('29º') && floor.name === '29º PAVIMENTO'))) {
              
              try {
                await db.insert(windows).values({
                  environmentId,
                  code: windowData.code,
                  type: windowData.type,
                  description: windowData.description,
                  width: windowData.width,
                  height: windowData.height,
                  material: windowData.material,
                  glassType: windowData.glassType,
                  quantity: windowData.quantity,
                  weight: windowData.weight,
                  observations: windowData.observations,
                  status: 'pending',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                });

                console.log(`    ✓ Caixilho adicionado: ${windowData.code}`);
                windowCount++;
              } catch (error) {
                console.error(`    ✗ Erro ao adicionar caixilho ${windowData.code}:`, error.message);
              }
            }
          }
        } catch (error) {
          console.error(`  ✗ Erro ao criar ambiente ${env.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Importação concluída!`);
    console.log(`📊 Estatísticas:`);
    console.log(`   - Ambientes criados: ${environmentCount}`);
    console.log(`   - Caixilhos adicionados: ${windowCount}`);
    console.log(`   - Total de itens: ${environmentCount + windowCount}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante importação:', error);
    process.exit(1);
  }
}

seedData();
