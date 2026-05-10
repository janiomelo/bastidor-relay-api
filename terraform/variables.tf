variable "s3_endpoint" {
  description = "Endpoint S3 (Cloudflare R2 ou similar)"
  type        = string
}

variable "s3_region" {
  description = "Regiao S3"
  type        = string
  default     = "auto"
}

variable "s3_bucket" {
  description = "Nome do bucket S3"
  type        = string
}

variable "s3_access_key_id" {
  description = "Access Key do S3"
  type        = string
  sensitive   = true
}

variable "s3_secret_access_key" {
  description = "Secret Access Key do S3"
  type        = string
  sensitive   = true
}

variable "github_username" {
  description = "Username GitHub para linked repos"
  type        = string
}

variable "github_token" {
  description = "Token GitHub para Railway integrar"
  type        = string
  sensitive   = true
}
