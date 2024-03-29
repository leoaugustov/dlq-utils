import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { invokeFunction } from "./lambda";
import { consumeMessages } from "./sqs-consumer";
import messageTemplater from "./message-templater";
import resourceValidator from "./resource-validator";

export default async ({ queueUrl, functionName, endpointUrl: endpoint, template, keepSource }) => {
  const sqsClient = new SQSClient({ endpoint });
  const lambdaClient = new LambdaClient({ endpoint });

  if (!(await allResourcesValid(sqsClient, queueUrl, lambdaClient, functionName))) {
    return;
  }

  let totalMessagesProcessed = 0;
  let invocationFailures = 0;

  const messageConsumer = async (message) => {
    totalMessagesProcessed++;
    const payload = template ? messageTemplater.applyTemplate(message.body, template) : message.body;
    const response = await invokeFunction(lambdaClient, functionName, payload);

    if (response.functionError) {
      invocationFailures++;
      logger.error(`Error while invoking function with message ${message.id}`);
      logger.errorDetail(`FunctionError: ${response.functionError}; Payload: ${response.payload}`);
      return false;
    } else {
      logger.info(
        `Function successfully invoked with message ${message.id}. ${keepSource ? "" : "Message deleted from queue"}`
      );
      return !keepSource;
    }
  };

  await consumeMessages(sqsClient, queueUrl, messageConsumer);
  logger.success(`Finished queue-to-lambda successfully. ${totalMessagesProcessed} messages processed`);
  if (invocationFailures > 0) {
    logger.warning(`${invocationFailures} messages failed to be processed and were not deleted from queue`);
  }
};

async function allResourcesValid(sqsClient, queueUrl, lambdaClient, functionName) {
  const resourcesToValidate = [
    {
      type: "queue",
      value: queueUrl,
    },
    {
      type: "function",
      value: functionName,
    },
  ];
  return await resourceValidator.validate(resourcesToValidate, sqsClient, lambdaClient);
}
