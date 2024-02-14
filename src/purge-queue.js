import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { consumeMessages } from "./sqs-consumer";
import resourceValidator from "./resource-validator";

export default async ({ regex: condition, queueUrl, endpointUrl: endpoint }) => {
  const sqsClient = new SQSClient({ endpoint });

  if (!(await resourceValidator.validateQueue(sqsClient, queueUrl))) {
    return;
  }
  const regex = new RegExp(condition);

  let totalMessages = 0;
  let totalMessagesDeleted = 0;
  const messageConsumer = async (message) => {
    totalMessages++;
    const messageBody = message.body;
    if (regex.test(messageBody)) {
      totalMessagesDeleted++;
      return true;
    }
    return false;
  };
  await consumeMessages(sqsClient, queueUrl, messageConsumer);
  logger.success(`Finished purge-queue successfully. ${totalMessagesDeleted} of ${totalMessages} messages were deleted`);
};
