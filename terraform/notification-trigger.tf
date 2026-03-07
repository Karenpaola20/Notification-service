resource "aws_lambda_event_source_mapping" "notification_trigger" {

  event_source_arn = aws_sqs_queue.notification_email_sqs.arn

  function_name = aws_lambda_function.send_notifications.arn

  batch_size = 1
}