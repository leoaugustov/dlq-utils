import queueToFile from "../../src/queue-to-file";
import { consumeLines } from "../../src/file-consumer";
import { temporaryFile } from "tempy";

const QUEUE_NAME = 'source-queue';

let sqsContainer;
let sqsClient;

beforeAll(async () => {
  sqsContainer = await setUpSqsService();
  sqsClient = createSqsClient();

  await createQueue(sqsClient, QUEUE_NAME);
});

afterEach(async () => {
  await cleanQueue(sqsClient, QUEUE_NAME);
});

afterAll(async () => {
  await sqsContainer.stop();
});

it('should consume messages from queue and save them in file', async () => {
  const queueUrl = getQueueUrl(QUEUE_NAME);
  const fileName = temporaryFile();

  await sendMessage(sqsClient, QUEUE_NAME, 'message-1');
  await sendMessage(sqsClient, QUEUE_NAME, 'message-2');
  await sendMessage(sqsClient, QUEUE_NAME, 'message-3');
  await sendMessage(sqsClient, QUEUE_NAME, 'message-4');

  await queueToFile({
    queueUrl,
    file: fileName,
    endpointUrl: SQS_ENDPOINT_URL
  });

  const lines = []
  await consumeLines(fileName, async line => lines.push(line));

  expect(lines).toIncludeSameMembers(['message-1', 'message-2', 'message-3', 'message-4']);
});
