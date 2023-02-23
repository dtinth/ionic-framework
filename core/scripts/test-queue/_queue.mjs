// @ts-check
import { QueueClient } from '@azure/storage-queue'
const queueName = 'testqueue-gha' + process.env.GITHUB_RUN_ID
export const queue = new QueueClient(String(process.env.AZURE_STORAGE_ACCOUNT_CONNECTION_STRING), queueName)
