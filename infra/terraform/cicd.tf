# ============================================================
# Cloud Build ⇔ GitHub 連携
# GitHub App のインストール承認はブラウザでの手動操作が必要なため、
# この connection リソースは import 前提（Terraform で新規作成しない）。
# ============================================================
resource "google_cloudbuildv2_connection" "github" {
  project  = var.project_id
  location = var.region
  name     = "oshiwatch-github"

  github_config {
    app_installation_id = 144386568
    authorizer_credential {
      oauth_token_secret_version = "projects/${var.project_id}/secrets/oshiwatch-github-github-oauthtoken-a5bcb3/versions/1"
    }
  }

  # OAuth トークンのバージョン等は手動連携時に決まる値のため差分検知しない
  lifecycle {
    ignore_changes = [github_config]
  }

  depends_on = [google_project_service.apis]
}

resource "google_cloudbuildv2_repository" "oshiwatch_ai" {
  project           = var.project_id
  location          = var.region
  name              = var.github_repo
  parent_connection = google_cloudbuildv2_connection.github.name
  remote_uri        = "https://github.com/${var.github_owner}/${var.github_repo}.git"
}

resource "google_cloudbuild_trigger" "deploy_main" {
  project  = var.project_id
  location = var.region
  name     = "oshiwatch-deploy-main"

  service_account = google_service_account.cloudbuild.id
  filename        = "cloudbuild.yaml"

  repository_event_config {
    repository = google_cloudbuildv2_repository.oshiwatch_ai.id
    push {
      branch = "^main$"
    }
  }
}
