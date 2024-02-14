import purgeQueue from "purge-queue";
import { consumeMessages } from "sqs-consumer";
import resourceValidator from "resource-validator";
jest.mock('sqs-consumer', () => ({
  consumeMessages: jest.fn()
}));
jest.mock('resource-validator', () => ({
  validateQueue: jest.fn()
}));

it('should not consume messages when queue is not valid', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

  resourceValidator.validateQueue.mockReturnValueOnce(false);

  await purgeQueue({ condition: ".", queueUrl });

  expect(consumeMessages.mock.calls.length).toBe(0);
});

it('should use consumer that returns true when message matches condition', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const endpointUrl = 'http://localhost:4566';

  resourceValidator.validateQueue.mockReturnValueOnce(true);

  await purgeQueue({ regex: "\"field\":\\s*\"value\"", queueUrl, endpointUrl });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(queueUrl);

  const createdSqsClient = consumeMessages.mock.calls[0][0];
  const resolvedEndpoint = await createdSqsClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);

  const messageBody = '{ "field": "value", "other": 2 }';
  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: messageBody });
  expect(shouldDeleteMessage).toBe(true);
});

it('should use consumer that returns false when message does not match condition', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const endpointUrl = 'http://localhost:4566';

  resourceValidator.validateQueue.mockReturnValueOnce(true);

  await purgeQueue({ regex: "\"field\":\\s*\"value\"", queueUrl, endpointUrl });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(queueUrl);

  const createdSqsClient = consumeMessages.mock.calls[0][0];
  const resolvedEndpoint = await createdSqsClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);

  const messageBody = '{ "field": "potato", "other": 2 }';
  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: messageBody });
  expect(shouldDeleteMessage).toBe(false);
});
