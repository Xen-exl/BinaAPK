export default async function handler(req, context) {
  const isExpressLike = typeof req.json !== 'function' && typeof arguments[1] !== 'undefined';
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight CORS if needed
  if (req.method === 'OPTIONS') {
    if (isExpressLike) {
      const res = arguments[1];
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).end();
    }
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    if (isExpressLike) {
      const res = arguments[1];
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(405).json({ error: 'Method Not Allowed' });
    }
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
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
    if (isExpressLike) {
      const res = arguments[1];
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json({ error: 'Invalid JSON request' });
    }
    return new Response(JSON.stringify({ error: 'Invalid JSON request' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { target_repo, user_token, app_name, app_id, app_icon_base64 } = bodyData;

  if (!target_repo || !user_token || !app_name || !app_id) {
    const errObj = { error: 'Sila lengkapkan semua medan yang wajib.' };
    if (isExpressLike) {
      const res = arguments[1];
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(400).json(errObj);
    }
    return new Response(JSON.stringify(errObj), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Sanitize the target_repo to make sure it's just 'username/repo' and not a full URL
  let clean_target_repo = target_repo.trim();
  if (clean_target_repo.startsWith('http')) {
    try {
      const urlObj = new URL(clean_target_repo);
      clean_target_repo = urlObj.pathname.substring(1).replace(/\.git$/, '');
    } catch (e) { }
  }

  try {
    const workflowPath = '.github/workflows/xen-binaapk-build.yml';
    const fileUrl = `https://api.github.com/repos/${clean_target_repo}/contents/${workflowPath}`;

    // 1. Get default branch of target_repo
    const repoRes = await fetch(`https://api.github.com/repos/${clean_target_repo}`, {
      headers: {
        'Authorization': `Bearer ${user_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!repoRes.ok) {
      const errObj = { error: 'Gagal mengakses repository. Sila pastikan URL dan Token PAT anda sah dan mempunyai hak cipta "repo" & "workflow".' };
      if (isExpressLike) {
        const res = arguments[1];
        Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(repoRes.status).json(errObj);
      }
      return new Response(JSON.stringify(errObj), {
        status: repoRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const repoData = await repoRes.json();
    const defaultBranch = repoData.default_branch;

    // 2. Check if file exists to get SHA
    let fileSha;
    const getRes = await fetch(fileUrl, {
      headers: {
        'Authorization': `Bearer ${user_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });
    if (getRes.ok) {
      const getJson = await getRes.json();
      fileSha = getJson.sha;
    }

    // 3. (Optional) Upload Icon if provided
    let iconStep = '';
    if (app_icon_base64) {
      const iconPath = 'android-icon.png';
      const iconUrl = `https://api.github.com/repos/${clean_target_repo}/contents/${iconPath}`;

      let iconSha;
      try {
        const iconRes = await fetch(iconUrl, {
          headers: {
            'Authorization': `Bearer ${user_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        if (iconRes.ok) {
          const iconJson = await iconRes.json();
          iconSha = iconJson.sha;
        }
      } catch (e) { }

      await fetch(iconUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user_token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Update app icon for BinaAPK',
          content: app_icon_base64.split(',')[1] || app_icon_base64,
          sha: iconSha,
          branch: defaultBranch
        })
      });

      iconStep = `
      - name: Generate App Icons
        working-directory: ./builder
        run: |
          if [ -f "../user_repo/android-icon.png" ]; then
            cp ../user_repo/android-icon.png ./icon.png
            npm install @capacitor/assets --no-save
            npx capacitor-assets generate --android --assetPath .
          fi
`;
    }

    const workflowContent = `name: BinaAPK Builder

on:
  workflow_dispatch:
    inputs:
      app_name:
        description: 'App Name'
        required: true
        default: 'Xen App'
        type: string
      app_id:
        description: 'App ID (e.g., com.example.app)'
        required: true
        default: 'com.xen.app'
        type: string

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - name: Checkout Target Repository
        uses: actions/checkout@v4
        with:
          path: user_repo

      - name: Checkout Base Builder Repository
        uses: actions/checkout@v4
        with:
          repository: Xen-exl/BinaAPK
          path: builder

      - name: Prepare Web Assets
        run: |
          mkdir -p builder/web
          rm -rf builder/web/*
          
          echo "Checking user_repo structure:"
          ls -F user_repo/
          
          # Find the directory containing index.html in the user repo
          # We check common build output directories first, then root
          WEB_SOURCE_DIR=""
          for dir in "out" "dist" "build" "public" "."; do
            if [ -f "user_repo/$dir/index.html" ]; then
              WEB_SOURCE_DIR="user_repo/$dir"
              echo "Found index.html in $WEB_SOURCE_DIR"
              break
            fi
          done
          
          if [ -z "$WEB_SOURCE_DIR" ]; then
            echo "Error: Could not find index.html in user_repo root or common build directories (out, dist, build, public)."
            echo "Current user_repo structure:"
            find user_repo -maxdepth 2
            exit 1
          fi
          
          echo "Copying web assets from $WEB_SOURCE_DIR to builder/web/..."
          rsync -av --exclude='.git' --exclude='.github' "$WEB_SOURCE_DIR/" builder/web/
          
          echo "Contents of builder/web/:"
          ls -F builder/web/

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22'

      - name: Update Capacitor Config
        working-directory: ./builder
        run: |
          node -e "
            const fs = require('fs');
            const file = './capacitor.config.json';
            const config = JSON.parse(fs.readFileSync(file, 'utf8'));
            config.appName = '\${{ github.event.inputs.app_name }}';
            config.appId = '\${{ github.event.inputs.app_id }}';
            config.webDir = 'web';
            fs.writeFileSync(file, JSON.stringify(config, null, 2));
          "
` + iconStep + `
      - name: Install Dependencies
        working-directory: ./builder
        run: npm install

      - name: Generate Android Project
        working-directory: ./builder
        run: |
          rm -rf android
          npx cap add android

      - name: Setup Java JDK
        uses: actions/setup-java@v4
        with:
          distribution: 'zulu'
          java-version: '21'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v3

      - name: Build APK (Assemble Debug)
        working-directory: ./builder/android
        run: |
          chmod +x gradlew
          ./gradlew assembleDebug

      - name: Publish Release to User Repository
        working-directory: ./user_repo
        env:
          GH_TOKEN: \${{ secrets.GITHUB_TOKEN }}
        run: |
          TIMESTAMP=$(date +%s)
          TAG_NAME="build-$TIMESTAMP"
          APP_FILENAME="\${{ github.event.inputs.app_name }}"
          
          # Move APK
          mv ../builder/android/app/build/outputs/apk/debug/app-debug.apk "./\${APP_FILENAME}.apk"
          
          gh release create "$TAG_NAME" "./\${APP_FILENAME}.apk" --title "BinaAPK Build ($TAG_NAME)" --notes "Dihasilkan secara automatik menggunakan sistem BinaAPK."
`;

    const base64Content = typeof Buffer !== 'undefined'
      ? Buffer.from(workflowContent).toString('base64')
      : btoa(unescape(encodeURIComponent(workflowContent)));

    // 3. Create or update workflow file in target repo
    const putRes = await fetch(fileUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${user_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Set up BinaAPK workflow automatik',
        content: base64Content,
        sha: fileSha,
        branch: defaultBranch
      })
    });

    if (!putRes.ok) {
      const errText = await putRes.text();
      const errObj = { error: 'Gagal memuat naik workflow ke repo anda.', details: errText };
      if (isExpressLike) {
        const res = arguments[1];
        Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(putRes.status).json(errObj);
      }
      return new Response(JSON.stringify(errObj), {
        status: putRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Give GitHub API 1.5 seconds to propagate the new workflow file before dispatching
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 4. Dispatch the workflow
    const dispatchRes = await fetch(`https://api.github.com/repos/${clean_target_repo}/actions/workflows/xen-binaapk-build.yml/dispatches`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `Bearer ${user_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ref: defaultBranch,
        inputs: {
          app_name,
          app_id
        }
      })
    });

    if (!dispatchRes.ok) {
      const errorText = await dispatchRes.text();
      console.error('GitHub API Error Dispatch:', errorText);
      const errObj = { error: 'Gagal mencetuskan build di repo anda (Dispatcher Error).', details: errorText };
      if (isExpressLike) {
        const res = arguments[1];
        Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
        return res.status(dispatchRes.status).json(errObj);
      }
      return new Response(JSON.stringify(errObj), {
        status: dispatchRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const successObj = { success: true, message: 'Proses Build telah dimulakan pada Repo anda! Sila semak tab Actions / Releases di repository anda sebentar lagi.' };
    if (isExpressLike) {
      const res = arguments[1];
      Object.entries(corsHeaders).forEach(([k, v]) => res.setHeader(k, v));
      return res.status(200).json(successObj);
    }
    return new Response(JSON.stringify(successObj), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

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
