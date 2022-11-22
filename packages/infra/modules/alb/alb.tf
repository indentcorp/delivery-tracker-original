resource "aws_alb" "alb" {
  name    = "lb-delivery-tracker-${var.environment}"
  subnets = var.subnets
  security_groups = [
    aws_security_group.alb.id,
    var.ecs_security_group_id,
  ]

  tags = {
    Project     = "delivery-tracker"
    Environment = var.environment
  }
}

resource "aws_alb_listener" "http" {
  load_balancer_arn = aws_alb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_alb_listener" "https" {
  load_balancer_arn = aws_alb.alb.arn
  port              = "443"
  protocol          = "HTTPS"
  certificate_arn   = "arn:aws:acm:ap-northeast-1:599087160579:certificate/3739a6d3-bf32-4333-be90-c8ca4dbea20b"

  default_action {
    target_group_arn = aws_alb_target_group.default.arn
    type             = "forward"
  }
}
