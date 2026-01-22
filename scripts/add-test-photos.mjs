import mysql from 'mysql2/promise';

const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'romaneio_dubai_lm',
});

try {
  // Buscar um inspection_item para adicionar fotos
  const [items] = await connection.query(
    'SELECT id FROM inspection_items LIMIT 1'
  );

  if (items.length === 0) {
    console.log('Nenhum inspection_item encontrado. Criando dados de teste...');
    
    // Criar dados de teste
    const [projectResult] = await connection.query(
      'INSERT INTO projects (company_id, name, address, contractor) VALUES (1, "Projeto Teste", "Endereço Teste", "Contratante Teste")'
    );
    const projectId = projectResult.insertId;

    const [envResult] = await connection.query(
      'INSERT INTO environments (project_id, name) VALUES (?, "Ambiente Teste")',
      [projectId]
    );
    const environmentId = envResult.insertId;

    const [inspResult] = await connection.query(
      'INSERT INTO inspections (company_id, project_id, status) VALUES (1, ?, "in_progress")',
      [projectId]
    );
    const inspectionId = inspResult.insertId;

    const [itemResult] = await connection.query(
      'INSERT INTO inspection_items (company_id, inspection_id, environment_id) VALUES (1, ?, ?)',
      [inspectionId, environmentId]
    );
    const itemId = itemResult.insertId;

    // Adicionar 15 fotos de teste
    for (let i = 1; i <= 15; i++) {
      await connection.query(
        `INSERT INTO media_files (inspection_item_id, file_key, file_url, file_name, mime_type, file_size, media_type, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          `test-photo-${i}.jpg`,
          `https://via.placeholder.com/800x600?text=Foto+${i}`,
          `Foto Teste ${i}.jpg`,
          'image/jpeg',
          102400,
          'photo',
          `Foto de teste número ${i}`
        ]
      );
    }

    console.log(`✅ Dados de teste criados com sucesso!`);
    console.log(`   - Projeto ID: ${projectId}`);
    console.log(`   - Ambiente ID: ${environmentId}`);
    console.log(`   - Inspeção ID: ${inspectionId}`);
    console.log(`   - Item ID: ${itemId}`);
    console.log(`   - 15 fotos adicionadas`);
  } else {
    const itemId = items[0].id;
    
    // Adicionar 15 fotos de teste ao item existente
    for (let i = 1; i <= 15; i++) {
      await connection.query(
        `INSERT INTO media_files (inspection_item_id, file_key, file_url, file_name, mime_type, file_size, media_type, comment)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          itemId,
          `test-photo-${i}.jpg`,
          `https://via.placeholder.com/800x600?text=Foto+${i}`,
          `Foto Teste ${i}.jpg`,
          'image/jpeg',
          102400,
          'photo',
          `Foto de teste número ${i}`
        ]
      );
    }

    console.log(`✅ 15 fotos de teste adicionadas ao item ${itemId}`);
  }

  await connection.end();
} catch (error) {
  console.error('❌ Erro:', error.message);
  process.exit(1);
}
