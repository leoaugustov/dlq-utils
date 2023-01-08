import queueToFile from "queue-to-file";
import { consumeLines } from "file-consumer";
import { temporaryFile } from "tempy";

const QUEUE_NAME = 'source-queue';

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

it('should consume messages from queue (without deleting) and save them in file', async () => {
  const queueUrl = getQueueUrl(QUEUE_NAME);
  const fileName = temporaryFile();

  const messages = await sendTestMessages(sqsClient, QUEUE_NAME);

  await queueToFile({
    queueUrl,
    file: fileName,
    endpointUrl: SQS_ENDPOINT_URL
  });

  const lines = []
  await consumeLines(fileName, async line => lines.push(line));

  expect(lines).toIncludeSameMembers(messages);

  await waitVisibilityTimeout();
  await assertQueueContainsMessages(sqsClient, QUEUE_NAME, messages);
});
