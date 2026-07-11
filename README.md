# OshiWatch AI

推し の最新情報を AI が自動収集・要約し、メンバーごとにダッシュボード表示する Web アプリ。

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

## インフラ（Terraform）

GCPプロジェクトの骨格（API有効化・サービスアカウント・IAM・Artifact Registry・Secret Manager・
Cloud Run Job・Cloud Scheduler・Cloud Build トリガー）は `infra/terraform/` でコード管理しています。
`oshiwatch-backend`/`oshiwatch-frontend`（Cloud Run Service）はCI/CDが継続的にデプロイするため、
Terraformの管理対象外です。

```bash
cd infra/terraform
terraform init
export TF_VAR_supabase_service_role_key="<Supabaseのservice_roleキー>"
terraform plan
terraform apply
```

状態ファイルは `gs://oshiwatch-ai-tfstate` で共有しているので、チームメンバーは各自
`gcloud auth application-default login` 済みの状態で上記コマンドを実行すれば同じ状態を参照できます。
