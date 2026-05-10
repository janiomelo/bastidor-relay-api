resource "random_password" "postgres_password" {
  length  = 32
  special = true
}

resource "railway_project" "main" {
  name = var.project_name
}

resource "railway_environment" "production" {
  project_id = railway_project.main.id
  name       = var.environment_name
}

# PostgreSQL
resource "railway_postgres" "main" {
  project_id     = railway_project.main.id
  environment_id = railway_environment.production.id
  name           = "postgres"

  initial_database_name = "bastidor_relay"
  database_username     = "bastidor"
  database_password     = random_password.postgres_password.result
  postgres_version      = var.postgres_version
}

# API Service
resource "railway_service" "api" {
  project_id     = railway_project.main.id
  environment_id = railway_environment.production.id
  name           = "api"
  
  source = {
    repo = {
      repo_name = "bastidor-relay-api"
      owner     = data.github_user.current.login
      branch    = "main"
    }
  }

  service_domain {
    name = "bastidor-relay"
  }

  variables = {
    NODE_ENV                    = var.node_env
    PORT                        = var.port
    LOG_LEVEL                   = var.log_level
    HEALTH_CHECK_TIMEOUT_MS     = var.health_check_timeout_ms
    HEALTH_CACHE_TTL_SECONDS    = var.health_cache_ttl_seconds
    DATABASE_URL                = "postgresql://${railway_postgres.main.username}:${random_password.postgres_password.result}@${railway_postgres.main.hostname}:${railway_postgres.main.port}/railway"
    S3_ENDPOINT                 = var.s3_endpoint
    S3_REGION                   = var.s3_region
    S3_BUCKET                   = var.s3_bucket
  }

  sensitive_variables = {
    S3_ACCESS_KEY_ID     = var.s3_access_key_id
    S3_SECRET_ACCESS_KEY = var.s3_secret_access_key
  }
}

# Integração PostgreSQL + API
resource "railway_integration" "postgres_to_api" {
  project_id = railway_project.main.id
  source_id  = railway_postgres.main.id
  target_id  = railway_service.api.id
}

data "github_user" "current" {
  username = var.github_username
}

# Outputs
output "database_url" {
  value     = railway_postgres.main.connection_string
  sensitive = true
}

output "api_domain" {
  value = railway_service.api.domain
}
