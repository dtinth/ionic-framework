// @ts-check
import { getJobs } from './_jobs.mjs';
import { queue } from './_queue.mjs';
import pMap from 'p-map';

console.log('Using queue', queue.name);
await queue.createIfNotExists();
await queue.clearMessages();
console.log('Queue cleared');

const jobs = await getJobs();
let finished = 0;
await pMap(
  jobs,
  async (job) => {
    const result = await queue.sendMessage(job.id);
    console.log(`Enqueued (${++finished}/${jobs.length})`, job.name, '=>', result.messageId);
  },
  { concurrency: 64 }
);

console.log('Finished adding jobs to queue', queue.name);
