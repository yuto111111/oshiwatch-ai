# ============================================================
# Cloud Run Job: crawl → summarize → embed バッチ
# ============================================================
resource "google_cloud_run_v2_job" "batch" {
  project  = var.project_id
  name     = "oshiwatch-batch"
  location = var.region

  template {
    template {
      service_account = google_service_account.jobs.email
      max_retries      = 0
      timeout          = "1800s"

      containers {
        image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.jobs.repository_id}/batch:latest"

        env {
          name  = "SUPABASE_URL"
          value = var.supabase_url
        }
        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
        env {
          name  = "VERTEX_AI_LOCATION"
          value = var.region
        }
        env {
          name = "SUPABASE_SERVICE_ROLE_KEY"
          value_source {
            secret_key_ref {
              secret  = google_secret_manager_secret.supabase_service_role_key.secret_id
              version = "latest"
            }
          }
        }
      }
    }
  }

  # CI/CD 側 (gcloud builds submit) がイメージを都度更新するため、
  # Terraform はイメージタグの差分を追わない
  lifecycle {
    ignore_changes = [template[0].template[0].containers[0].image]
  }

  depends_on = [google_project_service.apis]
}

# ============================================================
# Cloud Scheduler: 毎朝 6:00 JST にバッチを起動
# ============================================================
resource "google_cloud_run_v2_job_iam_member" "scheduler_invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_job.batch.name
  role     = "roles/run.invoker"
  member   = google_service_account.scheduler.member
}

resource "google_cloud_scheduler_job" "batch_daily" {
  project   = var.project_id
  region    = var.region
  name      = "oshiwatch-batch-daily"
  schedule  = "0 6 * * *"
  time_zone = "Asia/Tokyo"

  http_target {
    http_method = "POST"
    uri         = "https://${var.region}-run.googleapis.com/apis/run.googleapis.com/v1/namespaces/${var.project_id}/jobs/${google_cloud_run_v2_job.batch.name}:run"

    oauth_token {
      service_account_email = google_service_account.scheduler.email
    }
  }

  depends_on = [google_project_service.apis]
}
