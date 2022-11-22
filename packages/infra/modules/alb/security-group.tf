resource "aws_security_group" "alb" {
  name   = "delivery-tracker-${var.environment}-lb"
  vpc_id = var.vpc_id

  tags = {
    Name        = "delivery-tracker-${var.environment}-lb"
    Project     = "delivery-tracker"
    Environment = var.environment
  }
}

resource "aws_security_group_rule" "ingress" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "TCP"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
}

resource "aws_security_group_rule" "egress" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.alb.id
}
