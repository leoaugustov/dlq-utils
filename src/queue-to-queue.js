import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessage } from "./sqs";
import { consumeMessages } from "./sqs-consumer";

export default async ({ sourceQueueUrl, destQueueUrl, endpointUrl: endpoint }) => {
  const sqsClient = new SQSClient({ endpoint });
  let totalMessagesMoved = 0;

  const messageConsumer = async (message) => {
    totalMessagesMoved++;
    await sendMessage(sqsClient, destQueueUrl, message);
  };

  await consumeMessages(sqsClient, sourceQueueUrl, messageConsumer);
  logger.success(`Finished queue-to-queue successfully. ${totalMessagesMoved} messages moved`);
};
