require('dotenv').config();
const fs = require('fs');
const jwt = require('jsonwebtoken');

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const templateId = 'cmjekgysg000113503o7x6hjx';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const adminToken = jwt.sign({ sub: 'cmjdvi9th00015yd3kywruqru', name: 'Admin User', role: 'Admin', tenantId: 'cmjdvargw0000jb56y8uwua37' }, JWT_SECRET, { expiresIn: '1h' });

(async () => {
  try {
    console.log('Using token (first 20 chars):', adminToken.slice(0,20));
    const headers = { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' };

    console.log('Fetching template...');
    const getRes = await fetch(`${BASE}/templates/${templateId}`, { headers });
    if (!getRes.ok) throw new Error(`GET template failed: ${getRes.status}`);
    const tpl = await getRes.json();
    console.log('Template fetched. Preparing payload...');

    // Build payload expected by PUT
    const payload = {
      name: tpl.name,
      description: tpl.description,
      blocks: (tpl.blocks || []).map(b => ({
        title: b.title,
        description: b.description,
        order: b.order,
        questions: (b.questions || []).map(q => ({
          text: q.text,
          type: q.type,
          required: q.required,
          placeholder: q.placeholder,
          options: q.options
        }))
      })),
      rules: (tpl.rules || []).map(r => ({ expression: r.expression, action: r.action }))
    };

    // Write payload to file for inspection
    fs.writeFileSync('./last_payload.json', JSON.stringify(payload, null, 2));
    console.log('Payload written to last_payload.json. Sending PUT...');

    const putRes = await fetch(`${BASE}/templates/${templateId}`, { method: 'PUT', headers, body: JSON.stringify(payload) });
    const putBody = await putRes.text();
    console.log('PUT status:', putRes.status);
    try { console.log('PUT body:', JSON.parse(putBody)); } catch(e){ console.log('PUT body text:', putBody); }
    if (!putRes.ok) process.exit(1);
  } catch (e) {
    console.error('ERROR', e && e.message ? e.message : e);
    process.exit(1);
  }
})();
