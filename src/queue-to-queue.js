import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessage } from "./sqs";
import { consumeMessages } from "./sqs-consumer";
import resourceValidator from "./resource-validator";
import messageTemplater from "./message-templater";

export default async ({ sourceQueueUrl, destQueueUrl, endpointUrl: endpoint, template, keepSource }) => {
  const sqsClient = new SQSClient({ endpoint });

  if (!(await allQueuesValid(sqsClient, sourceQueueUrl, destQueueUrl))) {
    return;
  }

  let totalMessagesMoved = 0;
  const messageConsumer = async (message) => {
    totalMessagesMoved++;
    let messageBody = message.body;
    if (template) {
      messageBody = messageTemplater.applyTemplate(messageBody, template);
    }
    await sendMessage(sqsClient, destQueueUrl, messageBody);
    return !keepSource;
  };

  await consumeMessages(sqsClient, sourceQueueUrl, messageConsumer);
  logger.success(
    `Finished queue-to-queue successfully. ${totalMessagesMoved} messages ${keepSource ? "copied" : "moved"}`
  );
};

async function allQueuesValid(sqsClient, ...queueUrls) {
  const resourcesToValidate = queueUrls.map((queueUrl) => ({ type: "queue", value: queueUrl }));

  return await resourceValidator.validate(resourcesToValidate, sqsClient);
}
