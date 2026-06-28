# OshiWatch AI

Snow Man の最新情報を AI が自動収集・要約し、メンバーごとにダッシュボード表示する Web アプリ。

## Tech Stack

- **Frontend**: Next.js 14 (TypeScript) + Tailwind CSS
- **Backend**: FastAPI (Python)
- **AI**: Gemini 2.5 Flash (Vertex AI) — 要約生成 + RAG チャット
- **DB**: Supabase (PostgreSQL + pgvector)
- **Infra**: Google Cloud Run + Cloud Build (CI/CD) + Terraform

## 画面構成

- `/` — ダッシュボード: グループ全体サマリー + メンバーカード×9
- `/member/[name]` — メンバー詳細: 過去サマリー履歴 + AIチャット

## ローカル起動

```bash
# Backend
cd backend
cp .env.example .env  # 値を設定
pip install -r requirements.txt
uvicorn src.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

## CI/CD

`main` ブランチへの push で Cloud Build が自動起動し、Cloud Run へデプロイされます。