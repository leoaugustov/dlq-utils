import { SQSClient } from '@aws-sdk/client-sqs';
import { consumeLines } from './file-consumer';
import { sendMessage } from './sqs';

export default async ({ file, queueUrl }) => {
  const sqsClient = new SQSClient({});
  await consumeLines(file, async message => await sendMessage(sqsClient, queueUrl, message));
}