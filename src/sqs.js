import {
  SendMessageCommand,
  ReceiveMessageCommand,
  DeleteMessageBatchCommand,
  GetQueueUrlCommand,
  SQSServiceException,
} from "@aws-sdk/client-sqs";

export async function sendMessage(sqsClient, queueUrl, message) {
  const response = await sqsClient.send(
    new SendMessageCommand({
      MessageBody: message,
      QueueUrl: queueUrl,
    })
  );
  return response.MessageId;
}

export async function receiveMessages(sqsClient, queueUrl) {
  const response = await sqsClient.send(
    new ReceiveMessageCommand({
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,
      QueueUrl: queueUrl,
    })
  );

  const messages = response.Messages;
  if (messages) {
    return messages.map((m) => ({
      body: m.Body,
      id: m.MessageId,
      receiptHandle: m.ReceiptHandle,
    }));
  }
  return [];
}

export async function deleteMessages(sqsClient, queueUrl, messagesReceiptHandles) {
  if (messagesReceiptHandles.length === 0) {
    return;
  }

  const inputEntries = [];
  const receiptHandlesById = new Map();
  messagesReceiptHandles.forEach((receiptHandle, i) => {
    inputEntries.push({
      Id: i.toString(),
      ReceiptHandle: receiptHandle,
    });
    receiptHandlesById.set(i, receiptHandle);
  });

  const response = await sqsClient.send(
    new DeleteMessageBatchCommand({
      Entries: inputEntries,
      QueueUrl: queueUrl,
    })
  );

  if (response.Failed) {
    throw new Error("Couldn't delete some messages");
  }
}

export async function isExistingQueue(sqsClient, queueName) {
  try {
    await sqsClient.send(
      new GetQueueUrlCommand({
        QueueName: queueName,
      })
    );
    return true;
  } catch (err) {
    if (err instanceof SQSServiceException) {
      return false;
    } else {
      throw err;
    }
  }
}
