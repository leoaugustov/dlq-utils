import fileToQueue from 'file-to-queue';
import { temporaryWriteTask } from 'tempy';

const QUEUE_NAME = 'dest-queue';

let sqsContainer;
let sqsClient;

beforeAll(async () => {
  sqsContainer = await setUpSqsService();
  sqsClient = createSqsClient();

  await createQueue(sqsClient, QUEUE_NAME);
});

afterAll(async () => {
  await sqsContainer.stop();
});

it('should consume file lines and send a message with each one of them', async () => {
  const queueUrl = getQueueUrl(QUEUE_NAME);

  await temporaryWriteTask(
    'first line\nsecond line\nthird line',
    async fileName => {
      await fileToQueue({
        file: fileName,
        queueUrl,
        endpointUrl: SQS_ENDPOINT_URL
      });
    }
  );

  await assertQueueContainsMessages(sqsClient, QUEUE_NAME, ['first line', 'second line', 'third line']);
});
