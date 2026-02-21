export default async function handler(req, context) {
  // If we're on standard Vercel Node.js express-like req/res:
  const isExpressLike = typeof req.json !== 'function' && typeof res !== 'undefined';

  // Handle preflight CORS if needed
  if (req.method === 'OPTIONS') {
    if (isExpressLike) return arguments[1].status(200).end();
    return new Response(null, { status: 200 });
  }

  if (req.method !== 'POST') {
    if (isExpressLike) return arguments[1].status(405).json({ error: 'Method Not Allowed' });
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
  }

  let bodyData;
  try {
    // Netlify / Vercel Edge (Web Request)
    if (!isExpressLike) {
      bodyData = await req.json();
    } else {
      // Vercel Node.js Serverless (Express shape)
      bodyData = req.body;
      if (typeof bodyData === 'string') bodyData = JSON.parse(bodyData);
    }
  } catch (err) {
    if (isExpressLike) return arguments[1].status(400).json({ error: 'Invalid JSON request' });
    return new Response(JSON.stringify({ error: 'Invalid JSON request' }), { status: 400 });
  }

  const { target_repo, user_token, app_name, app_id } = bodyData;

  if (!target_repo || !user_token || !app_name || !app_id) {
    const errObj = { error: 'Sila lengkapkan semua medan yang wajib.' };
    if (isExpressLike) return arguments[1].status(400).json(errObj);
    return new Response(JSON.stringify(errObj), { status: 400 });
  }

  // Sanitize the target_repo to make sure it's just 'username/repo' and not a full URL
  let clean_target_repo = target_repo.trim();
  if (clean_target_repo.startsWith('http')) {
    try {
      const urlObj = new URL(clean_target_repo);
      clean_target_repo = urlObj.pathname.substring(1).replace(/\.git$/, '');
    } catch (e) { }
  }

  // ENV var can be GITHUB_PAT on Vercel or Netlify
  const githubToken = process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;

  if (!githubToken) {
    const errObj = { error: 'Pelayan belum dikonfigurasi dengan GITHUB_PAT rahsia.' };
    if (isExpressLike) return arguments[1].status(500).json(errObj);
    return new Response(JSON.stringify(errObj), { status: 500 });
  }

  try {
    const response = await fetch('https://api.github.com/repos/Xen-exl/Xen-BinaAPK/actions/workflows/build-apk.yml/dispatches', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          target_repo: clean_target_repo,
          user_token,
          app_name,
          app_id
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', errorText);
      const errObj = { error: 'Gagal mencetuskan build di GitHub Actions.', details: errorText };
      if (isExpressLike) return arguments[1].status(response.status).json(errObj);
      return new Response(JSON.stringify(errObj), { status: response.status });
    }

    const successObj = { success: true, message: 'Proses Build telah dimulakan! Sila semak tab Actions / Releases di repository anda sebentar lagi.' };
    if (isExpressLike) return arguments[1].status(200).json(successObj);
    return new Response(JSON.stringify(successObj), { status: 200 });

  } catch (error) {
    console.error('Fetch Error:', error);
    const errObj = { error: 'Internal Server Error', details: error.message };
    if (isExpressLike) return arguments[1].status(500).json(errObj);
    return new Response(JSON.stringify(errObj), { status: 500 });
  }
}

export const config = {
  path: "/api/build"
};
