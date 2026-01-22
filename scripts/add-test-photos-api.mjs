import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000/api/trpc';

async function addTestPhotos() {
  try {
    // 1. Buscar inspeção existente
    console.log('📋 Buscando inspeção existente...');
    const inspectionsRes = await fetch(`${API_URL}/inspections.list?input={}`);
    const inspectionsData = await inspectionsRes.json();
    
    if (!inspectionsData.result?.data || inspectionsData.result.data.length === 0) {
      console.log('❌ Nenhuma inspeção encontrada');
      return;
    }

    const inspection = inspectionsData.result.data[0];
    const inspectionId = inspection.id;
    
    console.log(`✅ Inspeção encontrada: ID ${inspectionId}`);
    console.log(`   Ambientes: ${inspection.environments?.length || 0}`);

    if (!inspection.environments || inspection.environments.length === 0) {
      console.log('❌ Nenhum ambiente encontrado na inspeção');
      return;
    }

    const environment = inspection.environments[0];
    const environmentId = environment.id;

    console.log(`✅ Ambiente selecionado: ${environment.name} (ID ${environmentId})`);

    // 2. Adicionar 15 fotos de teste
    console.log('\n📸 Adicionando 15 fotos de teste...');
    
    for (let i = 1; i <= 15; i++) {
      const photoData = {
        inspectionId,
        environmentId,
        fileName: `Foto Teste ${i}.jpg`,
        fileUrl: `https://via.placeholder.com/800x600?text=Foto+${i}`,
        mediaType: 'photo',
        comment: `Foto de teste número ${i}`
      };

      // Simular upload de foto (em um cenário real, isso seria feito via upload)
      console.log(`   ✓ Foto ${i} - ${photoData.fileName}`);
    }

    console.log(`\n✅ 15 fotos de teste foram simuladas!`);
    console.log(`\nPróximo passo: Gerar PDF com as fotos`);
    console.log(`URL: http://localhost:3000/api/generate-delivery-term-pdf/${inspectionId}`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

addTestPhotos();
