import queueToFile from "queue-to-file";
import { consumeMessages } from "sqs-consumer";
import fs from "fs";
import resourceValidator from "resource-validator";
jest.mock('sqs-consumer', () => ({
  consumeMessages: jest.fn()
}));
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  createWriteStream: jest.fn()
}));
jest.mock('resource-validator', () => ({
  validate: jest.fn()
}));

it('should consume messages from queue and save them in file', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const file = 'path/filename.csv';
  const endpointUrl = 'http://localhost:4566';
  const lineWriter = { write: jest.fn() };

  fs.createWriteStream.mockReturnValueOnce(lineWriter);
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToFile({ queueUrl, file, endpointUrl });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(queueUrl);

  const createdSqsClient = consumeMessages.mock.calls[0][0];
  const resolvedEndpoint = await createdSqsClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);

  const message = { body: 'some message' };
  await consumeMessages.mock.calls[0][2](message);

  expect(lineWriter.write).toBeCalledWith('some message\n');
});

it('should create consumer that returns false', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const file = 'path/filename.csv';
  const lineWriter = { write: jest.fn() };

  fs.createWriteStream.mockReturnValueOnce(lineWriter);
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToFile({ queueUrl, file });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(false);
});

it('should not consume messages when queue is not valid', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const file = 'path/filename.csv';

  resourceValidator.validate.mockReturnValueOnce(false);

  await queueToFile({ queueUrl, file });

  expect(consumeMessages.mock.calls.length).toBe(0);
});
