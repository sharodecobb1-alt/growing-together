# Growing Together: free setup guide (Firebase + Gemini + Netlify)

Everything below has a free tier. Screens and button names change now and then, so if a label differs slightly, look for the closest match. You'll need two Google accounts: yours and April's (these are the only two that can sign in).

You'll collect these along the way. Keep a note open:
- Firebase config (6 values) → goes in `firebase-config.js`
- Gemini API key → Netlify setting `GEMINI_API_KEY`
- Firebase Web API key (same as `apiKey` in the config) → `FIREBASE_WEB_API_KEY`
- Your two emails → `ALLOWED_EMAILS`
- (Optional) YouTube API key → `YOUTUBE_API_KEY`

---

## Step 1: Put the code on GitHub
Netlify drag-and-drop does NOT run server functions, so we deploy from GitHub.
1. Make a free account at github.com and click **New repository** (name it `growing-together`, keep it **Private**).
2. Click **uploading an existing file**, drag in everything from this folder (keep the `netlify/functions/ai.js` folder structure), then **Commit changes**.

## Step 2: Create the Firebase project (sign-in + shared data)
1. Go to console.firebase.google.com → **Create a project** (any name; you can turn off Google Analytics).
2. **Add a web app:** on the project home click the web icon `</>`, give it a nickname, skip hosting, click **Register app**. Copy the `firebaseConfig` values it shows.
3. Open `firebase-config.js` in your GitHub repo (pencil icon) and paste each value over the `PASTE_...` placeholders. Commit.
4. **Turn on sign-in:** left menu **Build → Authentication → Get started → Sign-in method → Google → Enable**, pick a support email, **Save**.
5. **Create the database:** **Build → Firestore Database → Create database**, pick a location near you, start in **production mode**.
6. **Lock it to just you two:** Firestore → **Rules** tab. Paste in the contents of `firestore.rules`, replace `YOU@gmail.com` and `APRIL@gmail.com` with your real Google emails, click **Publish**.

## Step 3: Get a free Gemini API key
1. Go to aistudio.google.com/apikey and sign in with Google.
2. Click **Create API key** (choose or create a project), then copy the key.
3. Free-tier limits are generous for two people. If requests ever fail with a "model not found" message, open Google AI Studio's model list, pick a current Flash model, and set it in Netlify as `GEMINI_MODEL` (default is `gemini-2.5-flash`).

## Step 4 (optional): Free YouTube API key for real video links
Skip this and the app still works: it just links to YouTube search results instead of exact videos.
1. console.cloud.google.com → pick the same project Firebase made (or any project).
2. **APIs & Services → Library →** search **YouTube Data API v3 → Enable**.
3. **APIs & Services → Credentials → Create credentials → API key.** Click **Restrict key → Restrict to YouTube Data API v3**, save, copy it.

## Step 5: Deploy on Netlify
1. Make a free account at netlify.com (sign up with GitHub).
2. **Add new site → Import an existing project → GitHub →** choose `growing-together`. Leave build settings as they are (they come from `netlify.toml`) and deploy.
3. Open **Site configuration → Environment variables** and add:

| Name | Value |
|---|---|
| `GEMINI_API_KEY` | your Gemini key |
| `FIREBASE_WEB_API_KEY` | the `apiKey` from your Firebase config |
| `ALLOWED_EMAILS` | `you@gmail.com,april@gmail.com` (comma-separated) |
| `YOUTUBE_API_KEY` | optional, from Step 4 |

4. **Deploys → Trigger deploy → Deploy site** so the new variables take effect.
5. Copy your site address (like `something.netlify.app`; you can rename it in **Domain management**).

## Step 6: Allow your site to sign in
Firebase → **Authentication → Settings → Authorized domains → Add domain** → paste your Netlify address (without `https://`). Without this, Google sign-in will fail.

## Step 7: Install on your phones
- **iPhone:** open the site in **Safari** → Share → **Add to Home Screen**.
- **Android:** open in **Chrome** → menu → **Install app** / **Add to Home screen**.
Sign in with Google, pick your side and mascot, and tap **Get today's steps**. April does the same on her phone with her account and picks the other side.

## Troubleshooting
- **"Firebase isn't set up yet"**: `firebase-config.js` still has placeholders, or you haven't redeployed since editing it.
- **Sign-in popup fails**: Step 6 (authorized domain) or Google sign-in not enabled.
- **"This account isn't allowed"**: the email isn't in `ALLOWED_EMAILS` (check spelling) or you didn't redeploy after adding it.
- **"Gemini: ..." errors**: wrong key, or the model name needs updating (Step 3).
- **Can't see each other's progress**: both emails must be in `firestore.rules`, and you each need to have picked a different side.
- **App looks outdated after an update**: close it fully and reopen; the service worker refreshes the page when you're online.
- Keep API keys only in Netlify's environment variables, never in the code.
