# Crypto Dashboard — Frontend

Next.js dashboard untuk Market Intelligence Engine.

## Setup Local

```bash
npm install
cp .env.local.example .env.local
# Edit .env.local sesuai URL API kamu
npm run dev
```

Buka http://localhost:3000

## Deploy ke Vercel

### 1. Push ke GitHub dulu
```bash
git init
git add .
git commit -m "initial"
git remote add origin https://github.com/username/crypto-dashboard.git
git push -u origin main
```

### 2. Deploy di Vercel
1. Buka https://vercel.com → Sign in dengan GitHub
2. Klik "New Project" → Import repo crypto-dashboard
3. Di bagian **Environment Variables** tambahkan:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: URL API kamu (lihat catatan di bawah)
4. Klik Deploy

### ⚠️ Penting: API URL untuk Production

API FastAPI kamu jalan di localhost:8000 — Vercel tidak bisa akses itu.
Kamu butuh expose API ke internet. Opsi:

**Option A — ngrok (gratis, mudah):**
```bash
# Install ngrok dari https://ngrok.com
ngrok http 8000
# Akan dapat URL seperti: https://abc123.ngrok.io
# Pakai URL itu sebagai NEXT_PUBLIC_API_URL di Vercel
```

**Option B — Deploy backend ke Railway/Render (gratis):**
- Railway: https://railway.app
- Render: https://render.com
- Push backend ke GitHub → connect ke Railway → auto deploy

**Option C — VPS/server sendiri:**
- Set NEXT_PUBLIC_API_URL ke IP/domain server kamu

## Fitur
- ✅ Live signals dengan filter Direction & Timeframe
- ✅ Detail signal modal (AI thesis, reasoning, catalysts)
- ✅ Top opportunities dengan score breakdown
- ✅ Pipeline status & manual trigger
- ✅ Auto refresh setiap 30 detik
- ✅ Responsive mobile
