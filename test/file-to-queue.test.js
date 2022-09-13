import fileToQueue from '../src/file-to-queue';
import { consumeLines } from '../src/file-consumer';
import { sendMessage } from '../src/sqs';
import { SQSClient } from '@aws-sdk/client-sqs';
jest.mock('../src/file-consumer', () => ({
    consumeLines: jest.fn()
}));
jest.mock('../src/sqs', () => ({
    sendMessage: jest.fn()
}));

it('should consume file lines and send a message with each one them', async () => {
    const file = 'path/filename.csv';
    const queueUrl = 'https://sqs.us-east-1.amazonaws.com/00000000/test-queue';

    await fileToQueue({
        file,
        queueUrl
    });

    expect(consumeLines.mock.calls.length).toBe(1);
    expect(consumeLines.mock.calls[0][0]).toEqual(file);

    const message = 'some message';
    await consumeLines.mock.calls[0][1](message);

    expect(sendMessage).toBeCalledWith(expect.any(SQSClient), queueUrl, message);
});