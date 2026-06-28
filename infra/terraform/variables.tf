variable "project_id" {
  description = "GCP プロジェクト ID"
  type        = string
}

variable "region" {
  description = "Cloud Run をデプロイするリージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "env" {
  description = "環境識別子 (dev / prod)"
  type        = string
  default     = "dev"
}

variable "frontend_image" {
  description = "Frontend の Container Image URL"
  type        = string
  default     = "gcr.io/placeholder/frontend:latest"
}

variable "backend_image" {
  description = "Backend の Container Image URL"
  type        = string
  default     = "gcr.io/placeholder/backend:latest"
}