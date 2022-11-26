import { GenericContainer } from "testcontainers";
import { SQSClient, CreateQueueCommand, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { sendMessage, receiveMessages } from "../../../src/sqs";

jest.setTimeout(30000); // testTimeout does not work with profiles

let sqsEndpointUrl;

function getQueueUrl(queueName) {
  return `${sqsEndpointUrl}/queue/${queueName}`
}

global.getQueueUrl = getQueueUrl;

global.setUpSqsService = async () => {
  process.env['AWS_ACCESS_KEY_ID'] = "AKIAIOSFODNN7EXAMPLE";
  process.env['AWS_SECRET_ACCESS_KEY'] = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY";
  process.env['AWS_REGION'] = "us-east-1";

  const sqsContainer = await new GenericContainer("roribio16/alpine-sqs:1.2.0")
    .withExposedPorts(9324, 9325)
    .start();

  sqsEndpointUrl = `http://${sqsContainer.getHost()}:${sqsContainer.getMappedPort(9324)}`;
  global.SQS_ENDPOINT_URL = sqsEndpointUrl;

  return sqsContainer;
};

global.createSqsClient = () => {
  return new SQSClient({ endpoint: sqsEndpointUrl });
};

global.createQueue = async (sqsClient, queueName) => {
  await sqsClient.send(new CreateQueueCommand({ QueueName: queueName }));
};

global.cleanQueue = async (sqsClient, queueName) => {
  await sqsClient.send(new DeleteMessageBatchCommand({
    QueueUrl: getQueueUrl(queueName)
  }));
};

global.sendMessage = async (sqsClient, queueName, messageBody) => {
  await sendMessage(sqsClient, getQueueUrl(queueName), messageBody);
};

global.receiveMessages = async (sqsClient, queueName) => {
  return await receiveMessages(sqsClient, getQueueUrl(queueName));
};
