import logger from "./logger";
import { SQSClient } from "@aws-sdk/client-sqs";
import { consumeLines } from "./file-consumer";
import { sendMessage } from "./sqs";
import resourceValidator from "./resource-validator";

export default async ({ file, queueUrl, endpointUrl: endpoint }) => {
  const sqsClient = new SQSClient({ endpoint });

  if (!(await allResourcesValid(sqsClient, queueUrl, file))) {
    return;
  }

  let totalMessagesSent = 0;
  const lineConsumer = async (line, lineNumber) => {
    const messageId = await sendMessage(sqsClient, queueUrl, line);
    totalMessagesSent++;
    logger.info(`Line ${lineNumber} sent as message with ID ${messageId}`);
  };

  await consumeLines(file, lineConsumer);
  logger.success(`Finished file-to-queue successfully. ${totalMessagesSent} messages sent`);
};

async function allResourcesValid(sqsClient, queueUrl, filePath) {
  const resourcesToValidate = [
    {
      type: "queue",
      value: queueUrl,
    },
    {
      type: "file",
      value: filePath,
      requiredPermission: "read",
    },
  ];
  return await resourceValidator.validate(resourcesToValidate, sqsClient);
}
