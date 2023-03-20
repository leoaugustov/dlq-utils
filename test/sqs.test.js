import { sendMessage, receiveMessages, deleteMessages, isExistingQueue } from 'sqs';
import { SQSServiceException } from "@aws-sdk/client-sqs";

function createSqsClient() {
  return  { send: jest.fn() };
}

describe('sendMessage', () => {
  it('should build command correctly, call client and return message ID', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';
    const message = 'message';
    const messageId = '6cb083c5-c69b-49b6-9a78-f2ff95e07fa7';

    sqsClient.send.mockReturnValueOnce({
      MessageId: messageId
    });

    const returnedMessageId = await sendMessage(sqsClient, queueUrl, message);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.MessageBody).toBe(message);
    expect(commandInput.QueueUrl).toBe(queueUrl);
    expect(returnedMessageId).toBe(messageId);
  });
});

describe('receiveMessages', () => {
  it('should build command correctly, call client and map messages returned', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

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

    const returnedMessages = await receiveMessages(sqsClient, queueUrl);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.QueueUrl).toBe(queueUrl);
    expect(commandInput.MaxNumberOfMessages).toBe(10);
    expect(commandInput.WaitTimeSeconds).toBe(5);

    const expectedMessages = messages.map(m => ({
      body: m.Body,
      id: m.MessageId,
      receiptHandle: m.ReceiptHandle
    }));
    expect(returnedMessages).toEqual(expectedMessages);
  });

  it("should return empty array when response's Messages attribute undefined", async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

    sqsClient.send.mockReturnValueOnce({});

    const returnedMessages = await receiveMessages(sqsClient, queueUrl);

    expect(sqsClient.send.mock.calls.length).toBe(1);
    expect(returnedMessages).toHaveLength(0);
  })
});

describe('deleteMessages', () => {
  it('should do nothing when empty array of messages receipt handles', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

    await deleteMessages(sqsClient, queueUrl, []);

    expect(sqsClient.send.mock.calls.length).toBe(0);
  });

  it('should build command correctly and call client', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

    sqsClient.send.mockReturnValueOnce({});

    const messagesReceiptHandles = [ 'receiptHandle1', 'receiptHandle2' ];

    await deleteMessages(sqsClient, queueUrl, messagesReceiptHandles);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.QueueUrl).toEqual(queueUrl);
    expect(commandInput.Entries).toEqual([{
      Id: '0',
      ReceiptHandle: messagesReceiptHandles[0]
    }, {
      Id: '1',
      ReceiptHandle: messagesReceiptHandles[1]
    }]);
  });

  it('should throw error when some batch entry fails', async () => {
    const sqsClient = createSqsClient();
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

    sqsClient.send.mockReturnValueOnce({
      Failed: [{
        Id: '1234',
        Code: 'ERR123'
      }]
    });

    await expect(async () => await deleteMessages(sqsClient, queueUrl, [ 'receiptHandle1', 'receiptHandle2' ]))
      .rejects.toThrow(Error);
  })
});

describe('isExistingQueue', () => {
  it('should return true when client does not throw exception', async () => {
    const sqsClient = createSqsClient();
    const queueName = 'test-queue';

    const queueExists = await isExistingQueue(sqsClient, queueName);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.QueueName).toBe(queueName);

    expect(queueExists).toBe(true);
  });

  it('should return false when client throws SQSServiceException', async () => {
    const sqsClient = createSqsClient();
    const queueName = 'test-queue';

    sqsClient.send.mockRejectedValueOnce(new SQSServiceException('error'));

    const queueExists = await isExistingQueue(sqsClient, queueName);

    expect(sqsClient.send.mock.calls.length).toBe(1);

    const commandInput = sqsClient.send.mock.calls[0][0].input;
    expect(commandInput.QueueName).toBe(queueName);

    expect(queueExists).toBe(false);
  });

  it('should throw exception when client throws any exception except SQSServiceException', async () => {
    const sqsClient = createSqsClient();
    const queueName = 'test-queue';

    sqsClient.send.mockRejectedValueOnce(new Error('error'));

    await expect(async () => await isExistingQueue(sqsClient, queueName))
      .rejects.toThrow(Error);

    expect(sqsClient.send.mock.calls.length).toBe(1);
  });
});
