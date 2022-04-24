import { ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';

export async function receiveMessages(sqsClient) {
  const response = await sqsClient.send(new ReceiveMessageCommand({
    MaxNumberOfMessages: 10,
    WaitTimeSeconds: 5
  }));

  return response.Messages.map(m => ({
    body: m.Body,
    receiptHandle: m.ReceiptHandle
  }));
}

export async function deleteMessage(sqsClient, messageReceiptHandle) {
  await sqsClient.send(new DeleteMessageCommand({
    ReceiptHandle: messageReceiptHandle
  }));
}