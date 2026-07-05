# ============================================================
# API 有効化
# ============================================================
locals {
  apis = [
    "aiplatform.googleapis.com",
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudbuild.googleapis.com",
    "secretmanager.googleapis.com",
  ]
}

resource "google_project_service" "apis" {
  for_each = toset(local.apis)
  project  = var.project_id
  service  = each.value

  disable_on_destroy = false
}

# ============================================================
# Artifact Registry（コンテナイメージ保存先）
# ============================================================
resource "google_artifact_registry_repository" "jobs" {
  project       = var.project_id
  location      = var.region
  repository_id = "oshiwatch-jobs"
  description   = "OshiWatch AI batch job / backend / frontend images"
  format        = "DOCKER"

  depends_on = [google_project_service.apis]
}

# ============================================================
# サービスアカウント
# ============================================================
resource "google_service_account" "jobs" {
  project      = var.project_id
  account_id   = "oshiwatch-jobs"
  display_name = "OshiWatch AI batch jobs / backend API"
}

resource "google_service_account" "scheduler" {
  project      = var.project_id
  account_id   = "oshiwatch-scheduler"
  display_name = "OshiWatch AI Cloud Scheduler invoker"
}

resource "google_service_account" "cloudbuild" {
  project      = var.project_id
  account_id   = "oshiwatch-cloudbuild"
  display_name = "OshiWatch AI Cloud Build"
}

# ============================================================
# IAM: oshiwatch-jobs（バッチ / backend API が使う）
# ============================================================
resource "google_project_iam_member" "jobs_aiplatform_user" {
  project = var.project_id
  role    = "roles/aiplatform.user"
  member  = google_service_account.jobs.member
}

# ============================================================
# IAM: oshiwatch-cloudbuild（CI/CDパイプライン実行用）
# ============================================================
resource "google_project_iam_member" "cloudbuild_builder" {
  project = var.project_id
  role    = "roles/cloudbuild.builds.builder"
  member  = google_service_account.cloudbuild.member
}

resource "google_project_iam_member" "cloudbuild_log_writer" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = google_service_account.cloudbuild.member
}

resource "google_project_iam_member" "cloudbuild_storage_admin" {
  project = var.project_id
  role    = "roles/storage.objectAdmin"
  member  = google_service_account.cloudbuild.member
}

resource "google_project_iam_member" "cloudbuild_run_admin" {
  project = var.project_id
  role    = "roles/run.admin"
  member  = google_service_account.cloudbuild.member
}

resource "google_project_iam_member" "cloudbuild_sa_user" {
  project = var.project_id
  role    = "roles/iam.serviceAccountUser"
  member  = google_service_account.cloudbuild.member
}

resource "google_project_iam_member" "cloudbuild_artifact_writer" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"
  member  = google_service_account.cloudbuild.member
}

# Cloud Build のデフォルトサービスエージェントが GitHub 連携用シークレットを
# 作成できるようにする（builds connections create github に必要）
resource "google_project_iam_member" "cloudbuild_agent_secretmanager" {
  project = var.project_id
  role    = "roles/secretmanager.admin"
  member  = "serviceAccount:service-${data.google_project.this.number}@gcp-sa-cloudbuild.iam.gserviceaccount.com"
}

data "google_project" "this" {
  project_id = var.project_id
}

# ============================================================
# IAM: Cloud Scheduler → Cloud Run Job 起動権限は batch.tf 側で
# google_cloud_run_v2_job_iam_member として定義する
# ============================================================

# ============================================================
# チームメンバーの Editor 権限
# ============================================================
resource "google_project_iam_member" "team_editor" {
  for_each = toset(var.editor_members)
  project  = var.project_id
  role     = "roles/editor"
  member   = each.value
}

# ============================================================
# Secret Manager: Supabase service_role キー
# ============================================================
resource "google_secret_manager_secret" "supabase_service_role_key" {
  project   = var.project_id
  secret_id = "supabase-service-role-key"

  replication {
    auto {}
  }

  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "supabase_service_role_key" {
  secret      = google_secret_manager_secret.supabase_service_role_key.id
  secret_data = var.supabase_service_role_key
}

resource "google_secret_manager_secret_iam_member" "jobs_secret_accessor" {
  project   = var.project_id
  secret_id = google_secret_manager_secret.supabase_service_role_key.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = google_service_account.jobs.member
}
