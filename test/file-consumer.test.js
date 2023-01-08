import { temporaryWriteTask } from 'tempy';
import { consumeLines } from 'file-consumer';

describe('consumeLines', () => {
  it('should create liner with fileName and call consumer for each line on file ', async () => {
    const lineConsumer = jest.fn();

    await temporaryWriteTask(
      'first line\nsecond line\nthird line',
      async fileName => {
        await consumeLines(fileName, lineConsumer);
      }
    );

    expect(lineConsumer.mock.calls.length).toBe(3);
    expect(lineConsumer.mock.calls[0][0]).toEqual('first line');
    expect(lineConsumer.mock.calls[0][1]).toEqual(1);
    expect(lineConsumer.mock.calls[1][0]).toEqual('second line');
    expect(lineConsumer.mock.calls[1][1]).toEqual(2);
    expect(lineConsumer.mock.calls[2][0]).toEqual('third line');
    expect(lineConsumer.mock.calls[2][1]).toEqual(3);
  });

  it('should not call consumer when file is empty', async () => {
    const lineConsumer = jest.fn();

    await temporaryWriteTask(
      '',
      async fileName => {
        await consumeLines(fileName, lineConsumer);
      }
    );

    expect(lineConsumer.mock.calls.length).toBe(0);
  });

  it('should not call consumer for blank lines', async () => {
    const lineConsumer = jest.fn();

    await temporaryWriteTask(
      '\n\nthird line',
      async fileName => {
        await consumeLines(fileName, lineConsumer);
      }
    );

    expect(lineConsumer.mock.calls.length).toBe(1);
    expect(lineConsumer.mock.calls[0][0]).toEqual('third line');
  });
});
