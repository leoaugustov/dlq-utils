import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessage } from "./sqs";
import { consumeMessages } from "./sqs-consumer";
import messageTemplater from "./message-templater";

export default async ({ sourceQueueUrl, destQueueUrl, endpointUrl: endpoint, template }) => {
  const sqsClient = new SQSClient({ endpoint });
  let totalMessagesMoved = 0;

  const messageConsumer = async (message) => {
    totalMessagesMoved++;
    let messageBody = message.body;
    if (template) {
      messageBody = messageTemplater.applyTemplate(messageBody, template);
    }
    await sendMessage(sqsClient, destQueueUrl, messageBody);
  };

  await consumeMessages(sqsClient, sourceQueueUrl, messageConsumer);
  logger.success(`Finished queue-to-queue successfully. ${totalMessagesMoved} messages moved`);
};
