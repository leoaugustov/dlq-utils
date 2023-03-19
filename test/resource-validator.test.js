import resourceValidator from "resource-validator";
import { isExistingQueue } from 'sqs';
import { isExistingFunction } from 'lambda';
import { temporaryWriteTask } from 'tempy';

jest.mock('sqs', () => ({
  isExistingQueue: jest.fn()
}));
jest.mock('lambda', () => ({
  isExistingFunction: jest.fn()
}));

describe('validate', () => {
  it('should return true when file exists', async () => {
    await temporaryWriteTask(
      'some text',
      async filePath => {
        const valid = await resourceValidator.validate([{
          type: "file",
          value: filePath
        }]);

        expect(valid).toBe(true);
      }
    );
  });

  it('should return false when file does not exist', async () => {
    const valid = await resourceValidator.validate([{
      type: "file",
      value: "path/file"
    }]);

    expect(valid).toBe(false);
  });

  it('should extract queue name from queue URL and return true when queue exists', async () => {
    const sqsClient = { send: jest.fn() };
    isExistingQueue.mockReturnValueOnce(true);

    const valid = await resourceValidator.validate(
      [{
        type: "queue",
        value: "https://sqs.us-east-1.amazonaws.com/00000000/test-queue"
      }],
      sqsClient
    );

    expect(isExistingQueue).toBeCalledWith(sqsClient, "test-queue");
    expect(valid).toBe(true);
  });

  it('should extract queue name from queue URL and return false when queue does not exist', async () => {
    const sqsClient = { send: jest.fn() };
    isExistingQueue.mockReturnValueOnce(false);

    const valid = await resourceValidator.validate(
      [{
        type: "queue",
        value: "https://sqs.us-east-1.amazonaws.com/00000000/test-queue"
      }],
      sqsClient
    );

    expect(isExistingQueue).toBeCalledWith(sqsClient, "test-queue");
    expect(valid).toBe(false);
  });

  it('should return true when function exists', async () => {
    const lambdaClient = { send: jest.fn() };
    isExistingFunction.mockReturnValueOnce(true);

    const valid = await resourceValidator.validate(
      [{
        type: "function",
        value: "test-function"
      }],
      null,
      lambdaClient
    );

    expect(isExistingFunction).toBeCalledWith(lambdaClient, "test-function");
    expect(valid).toBe(true);
  });

  it('should return false when function exists', async () => {
    const lambdaClient = { send: jest.fn() };
    isExistingFunction.mockReturnValueOnce(false);

    const valid = await resourceValidator.validate(
      [{
        type: "function",
        value: "test-function"
      }],
      null,
      lambdaClient
    );

    expect(isExistingFunction).toBeCalledWith(lambdaClient, "test-function");
    expect(valid).toBe(false);
  });

  it('should validate file before every other resource', async () => {
    const sqsClient = { send: jest.fn() };
    const lambdaClient = { send: jest.fn() };

    const valid = await resourceValidator.validate(
      [{
        type: "file",
        value: "path/nonexistent-file"
      },
      {
        type: "queue",
        value: "https://sqs.us-east-1.amazonaws.com/00000000/test-queue"
      },
      {
        type: "function",
        value: "test-function"
      }],
      sqsClient,
      lambdaClient
    );

    expect(valid).toBe(false);
    expect(isExistingQueue.mock.calls.length).toBe(0);
    expect(isExistingFunction.mock.calls.length).toBe(0);
  });
});
