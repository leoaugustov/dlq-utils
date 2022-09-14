import logger from './logger';
import { SQSClient } from '@aws-sdk/client-sqs';
import { consumeLines } from './file-consumer';
import { sendMessage } from './sqs';

export default async ({ file, queueUrl }) => {
  const sqsClient = new SQSClient();
  let totalMessagesSent = 0;

  const lineConsumer = async (line, lineNumber) => {
    const messageId = await sendMessage(sqsClient, queueUrl, line);
    totalMessagesSent++;
    logger.info(`Line ${lineNumber} sent as message with ID ${messageId}`);
  };

  await consumeLines(file, lineConsumer);
  logger.success(`Finished file-to-queue successfully. ${totalMessagesSent} messages sent`);
}