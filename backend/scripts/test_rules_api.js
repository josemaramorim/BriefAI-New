const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

async function main(){
  const base = process.env.BASE_URL || 'http://localhost:3001';
  try{
    console.log('Logging in...');
    const loginRes = await fetch(`${base}/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@briefai.com', password: 'admin123' })
    });
    const login = await loginRes.json();
    console.log('LOGIN:', login);
    const token = login.token;
    if(!token) throw new Error('Login failed');

    console.log('Listing templates...');
    const tRes = await fetch(`${base}/templates`, { headers: { Authorization: `Bearer ${token}` } });
    const templates = await tRes.json();
    console.log('TEMPLATES:', templates);
    const tid = templates && templates[0] && templates[0].id;
    if(!tid) throw new Error('No template found');
    console.log('Using template', tid);

    console.log('Listing rules...');
    const rRes = await fetch(`${base}/templates/${tid}/rules`, { headers: { Authorization: `Bearer ${token}` } });
    let rules;
    const ctype = rRes.headers.get('content-type') || '';
    if (ctype.includes('application/json')) {
      rules = await rRes.json();
      console.log('RULES:', rules);
    } else {
      const text = await rRes.text();
      console.error('Rules endpoint returned non-JSON. Status:', rRes.status, 'Body:', text);
      throw new Error('Rules fetch returned non-JSON');
    }

    console.log('Creating rule...');
    const createRes = await fetch(`${base}/templates/${tid}/rules`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ expression: { questionId: '' }, action: { type: 'activate_block' } })
    });
    const created = await createRes.json();
    console.log('CREATE RESPONSE:', created);
  }catch(e){
    console.error('ERROR:', e);
    process.exit(1);
  }
}

main();
