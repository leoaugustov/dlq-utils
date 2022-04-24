import { receiveMessages, deleteMessage } from '../src/sqs';

function createSqsClient() {
  return  { send: jest.fn() };
}

describe('receiveMessages', () => {
  it('should build command correctly, call client and map messages returned', async () => {
    const sqsClient = createSqsClient();

    const messages = [{
      Body: 'messageBody1',
      ReceiptHandle: 'a12345',
      MessageId: 'b4567'
    }, {
      Body: 'messageBody2',
      ReceiptHandle: 'c6789',
      MessageId: 'd8910'
    }];

    sqsClient.send.mockReturnValueOnce({
      Messages: messages
    });

    const returnedMessages = await receiveMessages(sqsClient);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.MaxNumberOfMessages).toBe(10);
    expect(commandInput.WaitTimeSeconds).toBe(5);

    const expectedMessages = messages.map(m => ({
      body: m.Body,
      receiptHandle: m.ReceiptHandle
    }));
    expect(returnedMessages).toEqual(expectedMessages);
  });

  it("should return empty array when response's Messages attribute undefined", async () => {
    const sqsClient = createSqsClient();

    sqsClient.send.mockReturnValueOnce({});

    const returnedMessages = await receiveMessages(sqsClient);

    expect(sqsClient.send.mock.calls.length).toBe(1);
    expect(returnedMessages).toHaveLength(0);
  })
});

describe('deleteMessage', () => {
  it('should build command correctly and call client', async () => {
    const sqsClient = createSqsClient();

    const messageReceiptHandle = 'receiptHandle';

    await deleteMessage(sqsClient, messageReceiptHandle);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.ReceiptHandle).toBe(messageReceiptHandle);
  });
});