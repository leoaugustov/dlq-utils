import { receiveMessages, deleteMessages } from './sqs';

export async function consumeMessages(sqsClient, messageConsumer) {
  let messages = [];
  do {
    messages = receiveMessages(sqsClient);

    let messagesToDelete = [];
    messages.forEach(message => {
      if(messageConsumer(message)) {
        messagesToDelete.push(message.receiptHandle);
      }
    });
    deleteMessages(sqsClient, messagesToDelete);
    messagesToDelete = [];
  }while(messages.length > 0);
}