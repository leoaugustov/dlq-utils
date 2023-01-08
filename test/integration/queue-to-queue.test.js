import queueToQueue from 'queue-to-queue';

const SOURCE_QUEUE_NAME = 'source-queue';
const DEST_QUEUE_NAME = 'dest-queue';

let sqsContainer;
let sqsClient;

beforeAll(async () => {
  sqsContainer = await setUpSqsService();
  sqsClient = createSqsClient();

  await createQueue(sqsClient, SOURCE_QUEUE_NAME);
  await createQueue(sqsClient, DEST_QUEUE_NAME);
});

afterEach(async () => {
  await clearQueues(sqsClient, SOURCE_QUEUE_NAME, DEST_QUEUE_NAME);
});

afterAll(async () => {
  await sqsContainer.stop();
});

it('should consume messages from source queue and send them to dest queue', async () => {
  const messages = await sendTestMessages(sqsClient, SOURCE_QUEUE_NAME);

  var sourceQueueUrl = getQueueUrl(SOURCE_QUEUE_NAME);
  var destQueueUrl = getQueueUrl(DEST_QUEUE_NAME);
  await queueToQueue({
    sourceQueueUrl,
    destQueueUrl,
    endpointUrl: SQS_ENDPOINT_URL
  });

  await assertQueueContainsMessages(sqsClient, DEST_QUEUE_NAME, messages);
});

it('should keep messages in source queue when keepSource param is true', async () => {
  const messages = await sendTestMessages(sqsClient, SOURCE_QUEUE_NAME);

  var sourceQueueUrl = getQueueUrl(SOURCE_QUEUE_NAME);
  var destQueueUrl = getQueueUrl(DEST_QUEUE_NAME);
  await queueToQueue({
    sourceQueueUrl,
    destQueueUrl,
    endpointUrl: SQS_ENDPOINT_URL,
    keepSource: true
  });

  await assertQueueContainsMessages(sqsClient, DEST_QUEUE_NAME, messages);

  await waitVisibilityTimeout();
  await assertQueueContainsMessages(sqsClient, SOURCE_QUEUE_NAME, messages);
});
