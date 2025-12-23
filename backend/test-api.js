// Script de teste dos endpoints da API
const baseUrl = 'http://localhost:3001';

async function testAPI() {
  console.log('🚀 Iniciando testes da API BriefAI\n');

  // 1. Health Check
  console.log('1️⃣ Testando Health Check...');
  const health = await fetch(`${baseUrl}/health`);
  console.log('✅ Health:', await health.json());

  // 2. Seed Tenants
  console.log('\n2️⃣ Criando Tenants de teste...');
  const seed = await fetch(`${baseUrl}/seed`, { method: 'POST' });
  console.log('✅ Seed:', await seed.json());

  // 3. Buscar tenants (precisamos dos IDs)
  console.log('\n3️⃣ Buscando IDs dos tenants...');
  // Como não temos endpoint para listar tenants, vamos usar IDs fixos do seed
  // Você precisará verificar no banco os IDs reais criados

  // 4. Registrar usuário Admin
  console.log('\n4️⃣ Registrando usuário Admin...');
  const registerAdmin = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123',
      name: 'Admin Test',
      role: 'Admin',
      tenantId: 'TENANT_ID_AQUI' // Substitua pelo ID real
    })
  });
  const adminUser = await registerAdmin.json();
  console.log('✅ Admin registrado:', adminUser);

  // 5. Login Admin
  console.log('\n5️⃣ Fazendo login como Admin...');
  const loginAdmin = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@test.com',
      password: 'admin123'
    })
  });
  const { token } = await loginAdmin.json();
  console.log('✅ Token obtido:', token.substring(0, 20) + '...');

  // 6. Listar templates (deve estar vazio)
  console.log('\n6️⃣ Listando templates...');
  const listTemplates = await fetch(`${baseUrl}/templates`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('✅ Templates:', await listTemplates.json());

  // 7. Criar template
  console.log('\n7️⃣ Criando template...');
  const createTemplate = await fetch(`${baseUrl}/templates`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tenantId: 'TENANT_ID_AQUI', // Substitua pelo ID real
      name: 'Template Teste',
      description: 'Template de teste automático',
      blocks: [
        {
          title: 'Bloco 1',
          order: 0,
          questions: [
            { text: 'Pergunta 1', type: 'text', required: true },
            { text: 'Pergunta 2', type: 'textarea', required: false }
          ]
        }
      ],
      rules: [
        {
          expression: '{"test": true}',
          action: '{"type": "test"}'
        }
      ]
    })
  });
  const templateResult = await createTemplate.json();
  console.log('✅ Template criado:', templateResult);

  const templateId = templateResult.templateId;

  // 8. Buscar template por ID
  console.log('\n8️⃣ Buscando template por ID...');
  const getTemplate = await fetch(`${baseUrl}/templates/${templateId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('✅ Template:', await getTemplate.json());

  // 9. Publicar template
  console.log('\n9️⃣ Publicando template...');
  const publishTemplate = await fetch(`${baseUrl}/templates/${templateId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log('✅ Template publicado:', await publishTemplate.json());

  // 10. Registrar Editor
  console.log('\n🔟 Registrando usuário Editor...');
  const registerEditor = await fetch(`${baseUrl}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'editor@test.com',
      password: 'editor123',
      name: 'Editor Test',
      role: 'Editor',
      tenantId: 'TENANT_ID_AQUI'
    })
  });
  console.log('✅ Editor registrado:', await registerEditor.json());

  // 11. Login Editor
  console.log('\n1️⃣1️⃣ Login como Editor...');
  const loginEditor = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'editor@test.com',
      password: 'editor123'
    })
  });
  const { token: editorToken } = await loginEditor.json();
  console.log('✅ Token Editor obtido');

  // 12. Editor tentando publicar (deve falhar)
  console.log('\n1️⃣2️⃣ Editor tentando publicar (deve falhar)...');
  const editorPublish = await fetch(`${baseUrl}/templates/${templateId}/publish`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${editorToken}` }
  });
  const editorPublishResult = await editorPublish.json();
  console.log(editorPublish.status === 403 ? '✅ Bloqueado corretamente (403)' : '❌ Erro: deveria ter bloqueado', editorPublishResult);

  console.log('\n✨ Testes concluídos!');
}

testAPI().catch(console.error);
