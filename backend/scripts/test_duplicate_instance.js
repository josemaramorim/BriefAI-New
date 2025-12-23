require('dotenv').config();
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const instanceId = process.argv[2] || 'cmjeme71u0001hprr5nil40ll';
const targetVersion = process.argv[3] || null; // optional
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
const adminToken = jwt.sign({ sub: 'cmjdvi9th00015yd3kywruqru', name: 'Admin User', role: 'Admin', tenantId: 'cmjdvargw0000jb56y8uwua37' }, JWT_SECRET, { expiresIn: '1h' });

(async () => {
  try{
    const headers = { Authorization: `Bearer ${adminToken}`, 'Content-Type':'application/json' };
    const body = { targetVersionId: targetVersion, copyAnswers: true };
    console.log('Calling duplicate for', instanceId, '-> targetVersion', targetVersion);
    const res = await fetch(`${BASE}/brief-instances/${instanceId}/duplicate`, { method: 'POST', headers, body: JSON.stringify(body) });
    const data = await res.json();
    console.log('Status', res.status, data);
  }catch(e){
    console.error('Error', e);
    process.exit(1);
  }
})();
