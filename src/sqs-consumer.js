import { receiveMessages, deleteMessages } from "./sqs";

export async function consumeMessages(sqsClient, queueUrl, messageConsumer) {
  const processedMessages = [];
  let currentMessagesBatch = [];
  do {
    currentMessagesBatch = await receiveMessages(sqsClient, queueUrl);

    let messagesToDelete = [];
    for (const message of currentMessagesBatch) {
      if (processedMessages.includes(message.id)) {
        continue;
      }

      if (await messageConsumer(message)) {
        messagesToDelete.push(message.receiptHandle);
      } else {
        processedMessages.push(message.id);
      }
    }

    await deleteMessages(sqsClient, queueUrl, messagesToDelete);
  } while (currentMessagesBatch.length > 0);
}
