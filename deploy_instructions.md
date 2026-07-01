# TagAlong — Vercel Deployment Instructions

## Environment Variables for Vercel Dashboard

Go to **Vercel Dashboard → Your Project → Settings → Environment Variables** and add every key below.

### Required Variables

| Key | Value | Notes |
|-----|-------|-------|
| `SECRET_KEY` | *(generate one, see below)* | Django secret key for production |
| `DEBUG` | `False` | Must be `False` in production |
| `ALLOWED_HOSTS` | `your-app-name.vercel.app` | Replace with your actual Vercel domain |

**Generate a SECRET_KEY:**
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

### Database Variables (TiDB Serverless — Free MySQL)

| Key | Value | Notes |
|-----|-------|-------|
| `DB_NAME` | `tagalong_db` | Create this database in TiDB SQL Editor |
| `DB_USER` | `xxxxxxx.root` | From TiDB Connect dialog |
| `DB_PASSWORD` | `your-tidb-password` | Auto-generated during cluster creation |
| `DB_HOST` | `gateway01.us-east-1.prod.aws.tidbcloud.com` | From TiDB Connect dialog |
| `DB_PORT` | `4000` | TiDB default port |
| `DB_SSL_CA` | `/var/task/certs/isrgrootx1.pem` | Path to SSL cert inside the Vercel lambda |

**TiDB Setup (permanently free, no credit card):**
1. Sign up at [tidbcloud.com](https://tidbcloud.com/) with GitHub
2. Create a **Serverless** cluster (spending limit stays at $0)
3. Click **Connect** → select **General** → copy the host, user, and password
4. Open **SQL Editor** → run `CREATE DATABASE tagalong_db;`
5. Download the CA certificate from the Connect dialog

---

### Cloudinary Variables (Free Media Storage)

| Key | Value | Notes |
|-----|-------|-------|
| `CLOUDINARY_CLOUD_NAME` | `your-cloud-name` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | `123456789012345` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | `your-api-secret` | From Cloudinary dashboard |
| `USE_CLOUDINARY` | `True` | Enables Cloudinary for media uploads |

**Cloudinary Setup (permanently free, no credit card):**
1. Sign up at [cloudinary.com](https://cloudinary.com/)
2. Dashboard shows Cloud Name, API Key, and API Secret

---

### Optional Variables

| Key | Value | Notes |
|-----|-------|-------|
| `CORS_ALLOW_ALL` | `True` | Set to `False` for tighter security in production |

---

## Quick Deploy Checklist

1. **Install new packages locally:**
   ```powershell
   cd d:\programming\TagAlong\backend
   .\venv\Scripts\activate
   pip install whitenoise django-cloudinary-storage cloudinary
   ```

2. **Collect static files:**
   ```powershell
   python manage.py collectstatic --noinput
   ```

3. **Push to GitHub:**
   ```powershell
   cd d:\programming\TagAlong
   git add .
   git commit -m "Configure for Vercel deployment"
   git push origin main
   ```

4. **Deploy on Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Set **Root Directory** to `backend` (or leave as root — `vercel.json` handles routing)
   - Set **Framework Preset** to `Other`
   - Add all environment variables from the tables above
   - Click **Deploy**

5. **Run migrations against TiDB (one-time):**
   ```powershell
   cd d:\programming\TagAlong\backend
   .\venv\Scripts\activate
   $env:DB_NAME = "tagalong_db"
   $env:DB_USER = "your-tidb-user"
   $env:DB_PASSWORD = "your-tidb-password"
   $env:DB_HOST = "gateway01.us-east-1.prod.aws.tidbcloud.com"
   $env:DB_PORT = "4000"
   $env:DB_SSL_CA = "path/to/isrgrootx1.pem"
   python manage.py migrate
   ```

6. **Update Android base URL:**
   - Open `frontend/src/utils/config.ts`
   - Uncomment the `VERCEL PRODUCTION URL` line
   - Replace `your-app-name.vercel.app` with your actual Vercel domain
   - Comment out the `LOCAL DEVELOPMENT URL` block
   - Rebuild the APK

7. **Host APK on GitHub Releases:**
   - Build: `eas build -p android --profile preview` (free: 30 builds/month)
   - Go to GitHub → Releases → Create new release
   - Attach the `.apk` file
   - Share link: `https://github.com/<user>/TagAlong/releases/latest/download/app-release.apk`

---

## Files Modified

| File | Change |
|------|--------|
| `backend/core/settings.py` | `SECRET_KEY`, `DEBUG`, `DATABASES` → `os.getenv()` with local defaults; added whitenoise + Cloudinary |
| `backend/requirements.txt` | Added `whitenoise`, `django-cloudinary-storage`, `cloudinary` |
| `frontend/src/utils/config.ts` | Added commented-out Vercel production URL |
| `vercel.json` | **NEW** — routes all traffic to `backend/core/wsgi.py` |
| `deploy_instructions.md` | **NEW** — this file |

---

## Free Tier Limits (No Credit Card, No Expiry)

| Service | Limit |
|---------|-------|
| **Vercel Hobby** | 100 GB bandwidth/month |
| **TiDB Serverless** | 25 GiB storage, 250M Request Units/month |
| **Cloudinary** | 25 GB storage, 25 GB bandwidth/month |
| **GitHub Releases** | Unlimited downloads for public repos |
| **EAS Build** | 30 Android builds/month |
