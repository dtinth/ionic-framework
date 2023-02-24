// @ts-check
import { getJobs } from './_jobs.mjs';
import { queue } from './_queue.mjs';

console.log('Using queue', queue.name);

const jobs = await getJobs();

async function worker() {
  for (;;) {
    const result = await queue.receiveMessages({ numberOfMessages: 1, visibilityTimeout: 30 });
    if (!result.receivedMessageItems.length) {
      console.log('Did not get a new message. Checking queue size...');
      const properties = await queue.getProperties();
      const n = properties.approximateMessagesCount;
      console.log(`Approximate number of messages in queue: ${n}`);
      if (n === 0) {
        console.log('Queue is fully drained now.');
        return;
      } else {
        console.log('Waiting a while before checking again.');
        await new Promise((r) => setTimeout(r, 5e3));
      }
    }
    for (const item of result.receivedMessageItems) {
      const heartbeatInterval = setInterval(async () => {
        try {
          await queue.updateMessage(item.messageId, item.popReceipt, undefined, 30);
        } catch (error) {
          console.error(`Unable to perform heartbeat on ${item.messageId}`);
        }
      }, 15e3);
      try {
        const id = item.messageText;
        const job = jobs.find((job) => job.id === id);
        if (!job) {
          throw new Error(`Unable to find job by ID: ${id}`);
        }
        console.log('Work on', job.name);
        try {
          console.log(`::group::${job.name}`);
          await job.run();
        } finally {
          console.log('::endgroup::');
        }
      } catch (error) {
        console.error(`Job ${item.messageId} failed: ${error}`);
        process.exitCode = 1;
      } finally {
        clearTimeout(heartbeatInterval);
        await queue.deleteMessage(item.messageId, item.popReceipt);
      }
    }
  }
}

await worker();
