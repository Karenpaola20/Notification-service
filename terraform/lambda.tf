resource "aws_lambda_function" "send_notifications" {

  function_name = "send-notifications-lambda"

  runtime = "nodejs20.x"
  handler = "index.handler"

  timeout = 10
  memory_size = 256

  filename = "${path.module}/lambdas//send-notifications-lambda/notification.zip"
  source_code_hash = filebase64sha256("${path.module}/lambdas/send-notifications-lambda/notification.zip")

  role = aws_iam_role.lambda_exec.arn

  environment {
    variables = {
      TEMPLATE_BUCKET   = aws_s3_bucket.templates.bucket
      NOTIFICATION_TABLE = aws_dynamodb_table.notifications.name
    }
  }
}