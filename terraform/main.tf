terraform {
  required_version = ">= 1.0"

  required_providers {
    railway = {
      source  = "railwayapp/railway"
      version = "~> 0.3.0"
    }
  }

  # Descomentar depois de primeiro apply
  # backend "local" {
  #   path = "terraform.tfstate"
  # }
}

provider "railway" {
  api_token = var.railway_api_token
}

variable "railway_api_token" {
  description = "Railway API Token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Nome do projeto no Railway"
  type        = string
  default     = "bastidor"
}

variable "environment_name" {
  description = "Nome do environment"
  type        = string
  default     = "production"
}

variable "postgres_version" {
  description = "Versao do PostgreSQL"
  type        = string
  default     = "16"
}

variable "node_env" {
  description = "Ambiente Node"
  type        = string
  default     = "production"
}

variable "log_level" {
  description = "Nivel de log"
  type        = string
  default     = "info"
}

variable "port" {
  description = "Porta do servico"
  type        = number
  default     = 3000
}

variable "health_check_timeout_ms" {
  description = "Timeout do healthcheck em ms"
  type        = number
  default     = 500
}

variable "health_cache_ttl_seconds" {
  description = "TTL do cache de health em segundos"
  type        = number
  default     = 5
}

output "project_id" {
  description = "ID do projeto Railway"
  value       = railway_project.main.id
}

output "postgres_connection_string" {
  description = "Connection string do PostgreSQL"
  value       = "postgresql://${railway_postgres.main.username}:${random_password.postgres_password.result}@${railway_postgres.main.hostname}:${railway_postgres.main.port}/railway"
  sensitive   = true
}

output "api_url" {
  description = "URL da API em producao"
  value       = "https://${railway_service.api.domain}"
}
