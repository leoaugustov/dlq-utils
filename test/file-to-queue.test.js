import fileToQueue from 'file-to-queue';
import { consumeLines } from 'file-consumer';
import { sendMessage } from 'sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
import resourceValidator from "resource-validator";
jest.mock('file-consumer', () => ({
    consumeLines: jest.fn()
}));
jest.mock('sqs', () => ({
    sendMessage: jest.fn()
}));
jest.mock('resource-validator', () => ({
  validate: jest.fn()
}));

it('should consume file lines and send a message with each one of them', async () => {
    const file = 'path/filename.csv';
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
    const endpointUrl = 'http://localhost:4566';

    resourceValidator.validate.mockReturnValueOnce(true);

    await fileToQueue({ file, queueUrl, endpointUrl });

    expect(consumeLines.mock.calls.length).toBe(1);
    expect(consumeLines.mock.calls[0][0]).toEqual(file);

    const line = 'some message';
    await consumeLines.mock.calls[0][1](line);

    expect(sendMessage).toBeCalledWith(expect.any(SQSClient), queueUrl, line);

    const createdSqsClient = sendMessage.mock.calls[0][0];
    const resolvedEndpoint = await createdSqsClient.config.endpoint();

    expect(resolvedEndpoint.protocol).toBe('http:');
    expect(resolvedEndpoint.hostname).toBe('localhost');
    expect(resolvedEndpoint.port).toBe(4566);
});

it('should not consume file lines when some resource is not valid', async () => {
  const file = 'path/filename.csv';
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

  resourceValidator.validate.mockReturnValueOnce(false);

  await fileToQueue({ file, queueUrl });

  expect(consumeLines.mock.calls.length).toBe(0);
});
