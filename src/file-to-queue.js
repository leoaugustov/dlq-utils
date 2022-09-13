import { SQSClient } from '@aws-sdk/client-sqs';
import { DEFAULT_AWS_REGION } from './constants';
import { consumeLines } from './file-consumer';
import { sendMessage } from './sqs';

export default async ({ file, region = DEFAULT_AWS_REGION, queueUrl }) => {
  const sqsClient = new SQSClient({ region });
  await consumeLines(file, async message => await sendMessage(sqsClient, queueUrl, message));
}