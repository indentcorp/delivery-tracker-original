terraform {
  backend "remote" {
    organization = "indent"

    workspaces {
      prefix = "delivery-tracker-"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.16"
    }
  }

  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "ap-northeast-1"
}

locals {
  config = {
    dev = {
      environment = "dev"
      vpc_id      = "vpc-0ec41569c4883b9ee"
      subnets = [
        "subnet-02e3f88277d180bd3",
        "subnet-045efcb67f6404af6",
        "subnet-0b325c55227bc0e0f",
      ]
    }
    prod = {
      environment = "prod"
      vpc_id      = "vpc-06346b61"
      subnets = [
        "subnet-5bfbe212",
        "subnet-09a9e252",
        "subnet-e110f0ca",
      ]
    }
  }[terraform.workspace]
}

module "iam" {
  source = "./modules/iam"

  environment = local.config.environment
}

module "alb" {
  source = "./modules/alb"

  environment           = local.config.environment
  vpc_id                = local.config.vpc_id
  subnets               = local.config.subnets
  ecs_security_group_id = module.ecs.security_group_id
}

module "ecs" {
  source = "./modules/ecs"

  environment            = local.config.environment
  vpc_id                 = local.config.vpc_id
  subnets                = local.config.subnets
  target_group_arn       = module.alb.target_group_arn
  iam_execution_role_arn = module.iam.ecs_execution_role.arn
  iam_task_role_arn      = module.iam.ecs_task_role.arn
  image_tag              = var.image_tag
}
