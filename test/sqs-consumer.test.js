import { consumeMessages } from '../src/sqs-consumer';
import { receiveMessages, deleteMessages } from '../src/sqs';
jest.mock('../src/sqs', () => ({
  receiveMessages: jest.fn(),
  deleteMessages: jest.fn(),
}));

function createSqsClient() {
  return  { send: jest.fn() };
}

describe('consumeMessages', () => {
  it('should not execute message consumer when no messages received', async () => {
      const sqsClient = createSqsClient();
      const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
      const messageConsumer = jest.fn();

      receiveMessages.mockReturnValueOnce([]);

      await consumeMessages(sqsClient, queueUrl, messageConsumer);

      expect(receiveMessages).toBeCalledWith(sqsClient, queueUrl);
      expect(messageConsumer.mock.calls.length).toBe(0);
      expect(deleteMessages).toBeCalledWith(sqsClient, queueUrl, []);
  });

  it('should execute message consumer when messages received', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
    const messageConsumer = jest.fn();

    const messages = [{
      receiptHandle: 'a12345'
    }, {
      receiptHandle: 'c6789'
    }];

    receiveMessages
      .mockReturnValueOnce([messages[0]])
      .mockReturnValueOnce([messages[1]])
      .mockReturnValueOnce([]);

    await consumeMessages(sqsClient, queueUrl, messageConsumer);

    expect(receiveMessages).toHaveBeenNthCalledWith(3, sqsClient, queueUrl);

    expect(messageConsumer.mock.calls.length).toBe(2);
    expect(messageConsumer.mock.calls[0][0]).toEqual(messages[0]);
    expect(messageConsumer.mock.calls[1][0]).toEqual(messages[1]);
  });

  it('should delete message when message consumer return true for it', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
    const messageConsumer = jest.fn();
    messageConsumer.mockReturnValue(true);

    const messages = [{
      receiptHandle: 'a12345'
    }, {
      receiptHandle: 'c6789'
    }];

    receiveMessages
      .mockReturnValueOnce([messages[0]])
      .mockReturnValueOnce([messages[1]])
      .mockReturnValueOnce([]);

    await consumeMessages(sqsClient, queueUrl, messageConsumer);

    expect(receiveMessages).toHaveBeenNthCalledWith(3, sqsClient, queueUrl);

    expect(deleteMessages).toHaveBeenNthCalledWith(3, sqsClient, queueUrl, expect.any(Array));
    expect(deleteMessages.mock.calls[0][2]).toEqual([messages[0].receiptHandle]);
    expect(deleteMessages.mock.calls[1][2]).toEqual([messages[1].receiptHandle]);
    expect(deleteMessages.mock.calls[2][2]).toEqual([]);
  });

  it('should not delete message when message consumer return false for it', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
    const messageConsumer = jest.fn();
    messageConsumer.mockReturnValue(false);

    const messages = [{
      receiptHandle: 'a12345'
    }, {
      receiptHandle: 'c6789'
    }];

    receiveMessages
      .mockReturnValueOnce([messages[0]])
      .mockReturnValueOnce([messages[1]])
      .mockReturnValueOnce([]);

    await consumeMessages(sqsClient, queueUrl, messageConsumer);

    expect(receiveMessages).toHaveBeenNthCalledWith(3, sqsClient, queueUrl);
    expect(messageConsumer.mock.calls.length).toBe(2);

    expect(deleteMessages).toHaveBeenNthCalledWith(3, sqsClient, queueUrl, []);
  });
});