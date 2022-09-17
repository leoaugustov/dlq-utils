import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { LambdaClient } from "@aws-sdk/client-lambda";
import { invokeFunction } from "./lambda";
import { consumeMessages } from "./sqs-consumer";

export default async ({ queueUrl, functionName }) => {
  const sqsClient = new SQSClient();
  const lambdaClient = new LambdaClient();
  let totalMessagesProcessed = 0;
  let invocationFailures = 0;

  const messageConsumer = async (message) => {
    totalMessagesProcessed++;
    const response = await invokeFunction(lambdaClient, functionName, message.body);

    if (response.functionError) {
      invocationFailures++;
      logger.error(`Error while invoking function with message ${message.id}`);
      logger.errorDetail(`FunctionError: ${response.functionError}; Payload: ${response.payload}`);
      return false;
    } else {
      logger.info(`Function successfully invoked with message ${message.id}. Message deleted from queue`);
      return true;
    }
  };

  await consumeMessages(sqsClient, queueUrl, messageConsumer);
  logger.success(`Finished queue-to-lambda successfully. ${totalMessagesProcessed} messages processed`);
  if (invocationFailures > 0) {
    logger.warning(`${invocationFailures} messages failed to be processed and were not deleted from queue`);
  }
};
