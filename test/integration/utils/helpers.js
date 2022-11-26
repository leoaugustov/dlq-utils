import { GenericContainer } from "testcontainers";
import { SQSClient, CreateQueueCommand, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { sendMessage, receiveMessages } from '../../../src/sqs';

jest.setTimeout(30000); // testTimeout does not work with profiles

let sqsEndpointUrl;

function getQueueUrl(queueName) {
  return `${sqsEndpointUrl}/queue/${queueName}`
}

global.getQueueUrl = getQueueUrl;

global.setUpSqsService = async () => {
  const sqsContainer = await new GenericContainer("roribio16/alpine-sqs:1.2.0")
    .withExposedPorts(9324, 9325)
    .start();

  sqsEndpointUrl = `http://${sqsContainer.getHost()}:${sqsContainer.getMappedPort(9324)}`;
  global.SQS_ENDPOINT_URL = sqsEndpointUrl;

  return sqsContainer;
};

global.createSqsClient = () => {
  return new SQSClient({
    endpoint: sqsEndpointUrl,
    region: "us-east-1"
  });
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
