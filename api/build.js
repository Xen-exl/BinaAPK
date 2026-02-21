export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { target_repo, user_token, app_name, app_id } = req.body;

  if (!target_repo || !user_token || !app_name || !app_id) {
    return res.status(400).json({ error: 'Sila lengkapkan semua medan yang wajib.' });
  }

  // Use the secret Vercel Server token to trigger the workflow on our own central repo.
  // Note: The user token is PASSED to the workflow, not used to authenticate this API call, 
  // because the user token does not have access to trigger workflows on Xen-exl/Xen-BinaAPK.
  const vercelGithubToken = process.env.GITHUB_PAT; 

  if (!vercelGithubToken) {
    return res.status(500).json({ error: 'Pelayan Vercel belum dikonfigurasi dengan GITHUB_PAT rahsia.' });
  }

  try {
    const response = await fetch('https://api.github.com/repos/Xen-exl/Xen-BinaAPK/actions/workflows/build-apk.yml/dispatches', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${vercelGithubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          target_repo,
          user_token,
          app_name,
          app_id
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API Error:', errorText);
      return res.status(response.status).json({ error: 'Gagal mencetuskan build di GitHub Actions.', details: errorText });
    }

    return res.status(200).json({ success: true, message: 'Proses Build telah dimulakan! Sila semak tab Actions / Releases di repository anda sebentar lagi.' });
  } catch (error) {
    console.error('Fetch Error:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
