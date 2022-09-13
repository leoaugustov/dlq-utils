import { receiveMessages, deleteMessages } from './sqs';

export async function consumeMessages(sqsClient, queueUrl, messageConsumer) {
  let messages = [];
  do {
    messages = receiveMessages(sqsClient, queueUrl);

    let messagesToDelete = [];
    messages.forEach(message => {
      if(messageConsumer(message)) {
        messagesToDelete.push(message.receiptHandle);
      }
    });
    deleteMessages(sqsClient, queueUrl, messagesToDelete);
    messagesToDelete = [];
  }while(messages.length > 0);
}