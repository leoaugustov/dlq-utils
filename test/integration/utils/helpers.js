import { GenericContainer } from "testcontainers";
import { SQSClient, CreateQueueCommand, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { sendMessage } from '../../../src/sqs';

jest.setTimeout(30000); // testTimeout does not work with profiles

let sqsEndpointUrl;

global.setUpSqsService = async () => {
  const sqsContainer = await new GenericContainer("roribio16/alpine-sqs:1.2.0")
    .withExposedPorts(9324, 9325)
    .start();

  sqsEndpointUrl = `http://${sqsContainer.getHost()}:${sqsContainer.getMappedPort(9324)}`;
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
    QueueUrl: `${sqsEndpointUrl}/queue/${queueName}`
  }));
};

global.sendMessage = async (sqsClient, queueName, messageBody) => {
  await sendMessage(sqsClient, `${sqsEndpointUrl}/queue/${queueName}`, messageBody);
};
