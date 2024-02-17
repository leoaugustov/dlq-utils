#!/bin/bash
echo "Running SQS setup script..."

export AWS_DEFAULT_REGION=us-east-1
export AWS_ACCESS_KEY_ID=fake
export AWS_SECRET_ACCESS_KEY=fake

echo "Creating sqs queues..."
aws sqs create-queue --queue-name source-queue --endpoint-url http://sqs:9324
aws sqs create-queue --queue-name dest-queue --endpoint-url http://sqs:9324

aws sqs send-message --queue-url http://sqs:9324/000000000000/source-queue --message-body "{ "failing":"no" }" --endpoint-url http://sqs:9324
aws sqs send-message --queue-url http://sqs:9324/000000000000/source-queue --message-body "{ "failing":  "no" }" --endpoint-url http://sqs:9324
aws sqs send-message --queue-url http://sqs:9324/000000000000/source-queue --message-body "{ "failing": "yes" }" --endpoint-url http://sqs:9324
aws sqs send-message --queue-url http://sqs:9324/000000000000/source-queue --message-body "{ "failing":   "yes" }" --endpoint-url http://sqs:9324

echo "SQS setup done!"
