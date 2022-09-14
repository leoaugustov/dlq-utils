import queueToLambda from '../src/queue-to-lambda';
import { invokeFunction } from '../src/lambda';
import { consumeMessages } from '../src/sqs-consumer';
import { LambdaClient } from '@aws-sdk/client-lambda';
jest.mock('../src/sqs-consumer', () => ({
  consumeMessages: jest.fn()
}));
jest.mock('../src/lambda', () => ({
  invokeFunction: jest.fn()
}));

it('should consume messages from queue and invoke function with each one of them', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  invokeFunction.mockReturnValueOnce({});

  await queueToLambda({ queueUrl, functionName });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(queueUrl);

  const message = { body: 'some message' };
  await consumeMessages.mock.calls[0][2](message);

  expect(invokeFunction).toBeCalledWith(expect.any(LambdaClient), functionName, message.body);
});

it('should create consumer to return true when invocation response has not function error', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  invokeFunction.mockReturnValueOnce({});

  await queueToLambda({ queueUrl, functionName });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(true);
});

it('should create consumer to return false when invocation response has function error', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  invokeFunction.mockReturnValueOnce({
    functionError: 'Some Error'
  });

  await queueToLambda({ queueUrl, functionName });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(false);
});