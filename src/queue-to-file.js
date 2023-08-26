import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import fs from "fs";
import { consumeMessages } from "./sqs-consumer";
import resourceValidator from "./resource-validator";

export default async ({ file, queueUrl, endpointUrl: endpoint }) => {
  const sqsClient = new SQSClient({ endpoint });

  if (!(await resourceValidator.validateQueue(sqsClient, queueUrl))) {
    return;
  }

  const lineWriter = fs.createWriteStream(file);
  let totalMessagesSaved = 0;

  const messageConsumer = async (message) => {
    totalMessagesSaved++;
    lineWriter.write(`${message.body}\n`);
    return false;
  };

  await consumeMessages(sqsClient, queueUrl, messageConsumer);
  logger.success(`Finished queue-to-file successfully. ${totalMessagesSaved} messages saved to file`);
};
