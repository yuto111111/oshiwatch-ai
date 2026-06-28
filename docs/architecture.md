# アーキテクチャ概要

## システム構成

```
[Cloud Scheduler]
    │  定期実行（1時間ごと）
    ▼
[Cloud Run Jobs]
  job-crawl    : Snow Man 公式サイト・SNS をクロール
  job-summarize: Gemini 2.5 Flash で記事を要約・DB保存
  job-embed    : 記事を vector 化して articles テーブルに保存
    │
    ▼
[Supabase (PostgreSQL + pgvector)]
  members / daily_summaries / events / articles
    │
    ▼
[Cloud Run — Backend (FastAPI)]
  GET /api/summaries/group/today     → グループサマリー
  GET /api/summaries/members         → メンバーカード一覧
  GET /api/summaries/members/:name   → メンバー詳細
  POST /api/chat                     → RAG チャット
    │
    ▼
[Cloud Run — Frontend (Next.js)]
  /                  → ダッシュボード
  /member/:name      → メンバー詳細 + チャット
```

## AI の役割

| 処理 | 使用モデル | タイミング |
|------|-----------|-----------|
| 要約生成 | Gemini 2.5 Flash | job-summarize（定期バッチ） |
| RAG チャット | Gemini 2.5 Flash + pgvector | ユーザー質問時（リアルタイム） |

## CI/CD

`main` ブランチ push → Cloud Build 自動起動 → イメージビルド → Cloud Run デプロイ