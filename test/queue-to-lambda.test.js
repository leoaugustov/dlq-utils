import queueToLambda from 'queue-to-lambda';
import { invokeFunction } from 'lambda';
import { consumeMessages } from 'sqs-consumer';
import { LambdaClient } from '@aws-sdk/client-lambda';
import { SQSClient } from '@aws-sdk/client-sqs';
import resourceValidator from "resource-validator";
jest.mock('sqs-consumer', () => ({
  consumeMessages: jest.fn()
}));
jest.mock('lambda', () => ({
  invokeFunction: jest.fn()
}));
jest.mock('resource-validator', () => ({
  validate: jest.fn()
}));


it('should consume messages from queue and invoke function with each one of them', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';
  const endpointUrl = 'http://localhost:4566';

  invokeFunction.mockReturnValueOnce({});
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToLambda({ queueUrl, functionName, endpointUrl, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);
  expect(consumeMessages.mock.calls[0][1]).toEqual(queueUrl);

  const message = { body: 'some message' };
  await consumeMessages.mock.calls[0][2](message);

  expect(invokeFunction).toBeCalledWith(expect.any(LambdaClient), functionName, message.body);

  const createdSqsClient = consumeMessages.mock.calls[0][0];
  let resolvedEndpoint = await createdSqsClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);

  const createdLambdaClient = invokeFunction.mock.calls[0][0];
  resolvedEndpoint = await createdLambdaClient.config.endpoint();

  expect(resolvedEndpoint.protocol).toBe('http:');
  expect(resolvedEndpoint.hostname).toBe('localhost');
  expect(resolvedEndpoint.port).toBe(4566);
});

it('should create consumer that returns true when invocation response has not function error', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  invokeFunction.mockReturnValueOnce({});
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToLambda({ queueUrl, functionName, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(true);
});

it('should create consumer that returns false when invocation response has not function error and keepSource is true', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  invokeFunction.mockReturnValueOnce({});
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToLambda({ queueUrl, functionName, keepSource: true });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(false);
});

it('should create consumer that returns false when invocation response has function error', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  invokeFunction.mockReturnValueOnce({
    functionError: 'Some Error'
  });
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToLambda({ queueUrl, functionName, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const shouldDeleteMessage = await consumeMessages.mock.calls[0][2]({ body: 'some message' });
  expect(shouldDeleteMessage).toBe(false);
});

it('should apply the template to message body when it exists', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';
  const template = '{ "someArray": [ *msg* ] }';

  invokeFunction.mockReturnValueOnce({});
  resourceValidator.validate.mockReturnValueOnce(true);

  await queueToLambda({ queueUrl, functionName, template, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(1);

  const message = {
    body: '{ "field": "value" }',
    id: '1231124',
    receiptHandle: 'receipt-handle'
  };
  await consumeMessages.mock.calls[0][2](message);

  const invocationPayload = invokeFunction.mock.calls[0][2];
  expect(invocationPayload).toBe('{ "someArray": [ { "field": "value" } ] }');
});

it('should not consume messages when some resource is not valid', async () => {
  const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
  const functionName = 'function-name';

  resourceValidator.validate.mockReturnValueOnce(false);

  await queueToLambda({ queueUrl, functionName, keepSource: false });

  expect(consumeMessages.mock.calls.length).toBe(0);

  const expectedResourcesToValidate = [
    {
      type: "queue",
      value: queueUrl,
    },
    {
      type: "function",
      value: functionName,
    },
  ];
  expect(resourceValidator.validate)
    .toBeCalledWith(expectedResourcesToValidate, expect.any(SQSClient), expect.any(LambdaClient));
});
