variable "project_id" {
  description = "GCP プロジェクト ID"
  type        = string
  default     = "oshiwatch-ai"
}

variable "region" {
  description = "Cloud Run / Cloud Scheduler をデプロイするリージョン"
  type        = string
  default     = "asia-northeast1"
}

variable "env" {
  description = "環境識別子 (dev / prod)"
  type        = string
  default     = "dev"
}

variable "github_owner" {
  description = "GitHub リポジトリのオーナー"
  type        = string
  default     = "yuto111111"
}

variable "github_repo" {
  description = "GitHub リポジトリ名"
  type        = string
  default     = "oshiwatch-ai"
}

variable "supabase_url" {
  description = "Supabase プロジェクトの URL"
  type        = string
  default     = "https://pgrlbrvkhoosuwrzuvbo.supabase.co"
}

# service_role キーの値そのものは Terraform コードに書かない。
# 初回 apply 時に -var や TF_VAR_ 環境変数で渡し、Secret Manager にのみ保存する。
variable "supabase_service_role_key" {
  description = "Supabase service_role キー（Secret Manager に保存する。コードにもstateにも平文で残したくない場合は import 後 ignore_changes を検討）"
  type        = string
  sensitive   = true
}

variable "editor_members" {
  description = "プロジェクトに Editor 権限を持つチームメンバー（user:email 形式）"
  type        = list(string)
  default = [
    "user:ishigami88888888@gmail.com",
    "user:kazuki005276@gmail.com",
    "user:oshikatsu.ai.admin@gmail.com",
  ]
}
