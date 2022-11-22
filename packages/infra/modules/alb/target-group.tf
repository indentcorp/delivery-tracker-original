resource "aws_alb_target_group" "default" {
  name        = "delivery-tracker-${var.environment}-${substr(uuid(), 0, 4)}"
  target_type = "ip"
  port        = 8080
  protocol    = "HTTP"
  vpc_id      = var.vpc_id

  health_check {
    path     = "/"
    protocol = "HTTP"
  }

  lifecycle {
    create_before_destroy = true
    ignore_changes        = [name]
  }

  tags = {
    Project     = "delivery-tracker"
    Environment = var.environment
  }
}

resource "random_string" "alb_suffix" {
  length  = 4
  upper   = false
  special = false
}
