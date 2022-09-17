import { receiveMessages, deleteMessages } from "./sqs";

export async function consumeMessages(sqsClient, queueUrl, messageConsumer) {
  let messages = [];
  do {
    messages = await receiveMessages(sqsClient, queueUrl);

    let messagesToDelete = [];
    for (const message of messages) {
      if (await messageConsumer(message)) {
        messagesToDelete.push(message.receiptHandle);
      }
    }

    await deleteMessages(sqsClient, queueUrl, messagesToDelete);
    messagesToDelete = [];
  } while (messages.length > 0);
}
