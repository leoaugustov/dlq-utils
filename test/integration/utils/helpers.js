import { GenericContainer } from "testcontainers";
import { SQSClient, CreateQueueCommand, DeleteMessageBatchCommand } from "@aws-sdk/client-sqs";
import { sendMessage, receiveMessages } from "../../../src/sqs";
import { consumeMessages } from "../../../src/sqs-consumer";

const VISIBILITY_TIMEOUT = "6"; // must be greater than WaitTimeSeconds used to receive messages

jest.setTimeout(30000); // testTimeout does not work with profiles

global.waitVisibilityTimeout = () => new Promise(resolve => setTimeout(resolve, VISIBILITY_TIMEOUT * 1000));

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
  await sqsClient.send(new CreateQueueCommand({
    QueueName: queueName,
    Attributes: {
      "VisibilityTimeout": VISIBILITY_TIMEOUT
    }
  }));
};

global.clearQueues = async (sqsClient, ...queueNames) => {
  await waitVisibilityTimeout();

  const promises = queueNames.map((queueName) => consumeMessages(sqsClient, getQueueUrl(queueName), () => true));
  await Promise.all(promises);
};

global.sendTestMessages = async (sqsClient, queueName) => {
  const messages = [];
  for (let i = 1; i <= 10; i++) {
    const messageBody = `message-${i}`;
    messages.push(messageBody);
    await sendMessage(sqsClient, getQueueUrl(queueName), messageBody);
  }
  return messages;
};

global.assertQueueContainsMessages = async (sqsClient, queueName, expectedMessages) => {
  const messagesFoundInQueue = await receiveMessages(sqsClient, getQueueUrl(queueName));
  expect(messagesFoundInQueue.map(message => message.body)).toIncludeSameMembers(expectedMessages);
};

global.assertQueueIsEmpty = async (sqsClient, queueName) => {
  const messagesFoundInQueue = await receiveMessages(sqsClient, getQueueUrl(queueName));
  expect(messagesFoundInQueue).toHaveLength(0);
};
