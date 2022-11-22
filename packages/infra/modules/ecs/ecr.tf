resource "aws_ecr_repository" "repository" {
  name                 = "delivery-tracker"
  image_tag_mutability = "MUTABLE"

  tags = {
    Project     = "delivery-tracker"
    Environment = var.environment
  }
}
