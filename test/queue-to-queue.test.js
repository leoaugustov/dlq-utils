import queueToQueue from 'queue-to-queue';
import { consumeMessages } from 'sqs-consumer';
import { sendMessage } from 'sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
import resourceValidator from "resource-validator";
jest.mock('sqs-consumer', () => ({
  consumeMessages: jest.fn()
}));
jest.mock('sqs', () => ({
  sendMessage: jest.fn()
}));
jest.mock('resource-validator', () => ({
  validate: jest.fn()
}));

it('should consume messages from source queue and send them to dest queue', async () => {
  const sourceQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/source-test-queue';
  const destQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/dest-test-queue';
  const endpointUrl = 'http://localhost:4566';

  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToQueue({ sourceQueueUrl, destQueueUrl, endpointUrl, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(sourceQueueUrl);

  const message = { body: 'some message' };
  await consumeMessages.mock.calls[0][2](message);

  expect(sendMessage).toBeCalledWith(expect.any(SQSClient), destQueueUrl, message.body);

  const createdSqsClient = sendMessage.mock.calls[0][0];
  const resolvedEndpoint = await createdSqsClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);
});

it('should apply the template to message body when it exists', async () => {
  const sourceQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/source-test-queue';
  const destQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/dest-test-queue';
  const template = '{ "someArray": [ *msg* ] }';

  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToQueue({ sourceQueueUrl, destQueueUrl, template, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const message = { body: '{ "field": "value" }' };
  await consumeMessages.mock.calls[0][2](message);

  const messageSent = sendMessage.mock.calls[0][2];
  expect(messageSent).toBe('{ "someArray": [ { "field": "value" } ] }');
});

it('should create consumer that returns false when keepSource param is true', async () => {
  const sourceQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/source-test-queue';
  const destQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/dest-test-queue';

  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToQueue({ sourceQueueUrl, destQueueUrl, keepSource: true });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(false);
});

it('should create consumer that returns true when keepSource param is false', async () => {
  const sourceQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/source-test-queue';
  const destQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/dest-test-queue';

  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToQueue({ sourceQueueUrl, destQueueUrl, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(true);
});

it('should not consume messages when some queue is not valid', async () => {
  const sourceQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/source-test-queue';
  const destQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/dest-test-queue';

  resourceValidator.validate.mockReturnValueOnce(false);

  await queueToQueue({ sourceQueueUrl, destQueueUrl, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(0);
});
