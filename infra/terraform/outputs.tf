output "artifact_registry_repository" {
  description = "コンテナイメージの保存先"
  value       = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.jobs.repository_id}"
}

output "jobs_service_account_email" {
  value = google_service_account.jobs.email
}

output "scheduler_service_account_email" {
  value = google_service_account.scheduler.email
}

output "cloudbuild_service_account_email" {
  value = google_service_account.cloudbuild.email
}

output "batch_job_name" {
  value = google_cloud_run_v2_job.batch.name
}

output "scheduler_job_name" {
  value = google_cloud_scheduler_job.batch_daily.name
}
