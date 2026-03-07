resource "aws_sqs_queue" "notification_email_dlq" {
  name = "notification-email-error-sqs"
}

resource "aws_sqs_queue" "notification_email_sqs" {
  name = "notification-email-sqs"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.notification_email_dlq.arn
    maxReceiveCount = 3
  })
}