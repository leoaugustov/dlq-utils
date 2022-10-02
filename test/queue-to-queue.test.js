import queueToQueue from '../src/queue-to-queue';
import { consumeMessages } from '../src/sqs-consumer';
import { sendMessage } from '../src/sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
jest.mock('../src/sqs-consumer', () => ({
  consumeMessages: jest.fn()
}));
jest.mock('../src/sqs', () => ({
    sendMessage: jest.fn()
}));

it('should consume messages from source queue and send them to dest queue', async () => {
  const sourceQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/source-test-queue';
  const destQueueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/dest-test-queue';
  const endpointUrl = 'http://localhost:4566';

  await queueToQueue({ sourceQueueUrl, destQueueUrl, endpointUrl });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(sourceQueueUrl);

  const message = { body: 'some message' };
  await consumeMessages.mock.calls[0][2](message);

  expect(sendMessage).toBeCalledWith(expect.any(SQSClient), destQueueUrl, message);

  const createdSqsClient = sendMessage.mock.calls[0][0];
  const resolvedEndpoint = await createdSqsClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);
});
