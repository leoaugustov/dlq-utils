import { consumeMessages } from '../src/sqs-consumer';
import { receiveMessages, deleteMessages } from '../src/sqs';
jest.mock('../src/sqs', () => ({
  receiveMessages: jest.fn(),
  deleteMessages: jest.fn(),
}));

function createSqsClient() {
  return  { send: jest.fn() };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('consumeMessages', () => {
  it('should not execute message consumer when no messages received', async () => {
      const sqsClient = createSqsClient();
      const messageConsumer = jest.fn();

      receiveMessages.mockReturnValueOnce([]);

      await consumeMessages(sqsClient, messageConsumer);

      expect(receiveMessages.mock.calls.length).toBe(1);
      expect(messageConsumer.mock.calls.length).toBe(0);
      expect(deleteMessages.mock.calls.length).toBe(1);
      expect(deleteMessages.mock.calls[0][1]).toEqual([]);
  });

  it('should execute message consumer when messages received', async () => {
    const sqsClient = createSqsClient();
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

    await consumeMessages(sqsClient, messageConsumer);

    expect(receiveMessages.mock.calls.length).toBe(3);

    expect(messageConsumer.mock.calls.length).toBe(2);
    expect(messageConsumer.mock.calls[0][0]).toEqual(messages[0]);
    expect(messageConsumer.mock.calls[1][0]).toEqual(messages[1]);
  });

  it('should delete message when message consumer return true for it', async () => {
    const sqsClient = createSqsClient();
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

    await consumeMessages(sqsClient, messageConsumer);

    expect(receiveMessages.mock.calls.length).toBe(3);

    expect(deleteMessages.mock.calls.length).toBe(3);
    expect(deleteMessages.mock.calls[0][1]).toEqual([messages[0].receiptHandle]);
    expect(deleteMessages.mock.calls[1][1]).toEqual([messages[1].receiptHandle]);
    expect(deleteMessages.mock.calls[2][1]).toEqual([]);
  });

  it('should not delete message when message consumer return false for it', async () => {
    const sqsClient = createSqsClient();
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

    await consumeMessages(sqsClient, messageConsumer);

    expect(receiveMessages.mock.calls.length).toBe(3);
    expect(messageConsumer.mock.calls.length).toBe(2);

    expect(deleteMessages.mock.calls.length).toBe(3);
    expect(deleteMessages.mock.calls[0][1]).toEqual([]);
    expect(deleteMessages.mock.calls[1][1]).toEqual([]);
    expect(deleteMessages.mock.calls[2][1]).toEqual([]);
  });
});