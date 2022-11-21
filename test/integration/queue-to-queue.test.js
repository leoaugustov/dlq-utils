import queueToQueue from '../../src/queue-to-queue';

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
  await cleanQueue(sqsClient, SOURCE_QUEUE_NAME);
  await cleanQueue(sqsClient, DEST_QUEUE_NAME);
});

afterAll(async () => {
  await sqsContainer.stop();
});

it('should consume messages from source queue and send them to dest queue', async () => {
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-1');
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-2');
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-3');
  await sendMessage(sqsClient, SOURCE_QUEUE_NAME, 'message-4');

  // queueToQueue({

  // });
});
