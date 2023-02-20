import resourceValidator from "resource-validator";
import { isExistingQueue } from 'sqs';
import { temporaryWriteTask } from 'tempy';

jest.mock('sqs', () => ({
  isExistingQueue: jest.fn()
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
    isExistingQueue.mockReturnValueOnce(true);

    const valid = await resourceValidator.validate([{
      type: "queue",
      value: "https://sqs.us-east-1.amazonaws.com/00000000/test-queue"
    }]);

    expect(isExistingQueue).toBeCalledWith("test-queue");
    expect(valid).toBe(true);
  });

  it('should extract queue name from queue URL and return false when queue does not exist', async () => {
    isExistingQueue.mockReturnValueOnce(false);

    const valid = await resourceValidator.validate([{
      type: "queue",
      value: "https://sqs.us-east-1.amazonaws.com/00000000/test-queue"
    }]);

    expect(isExistingQueue).toBeCalledWith("test-queue");
    expect(valid).toBe(false);
  });
});
