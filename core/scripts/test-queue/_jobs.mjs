import {globby} from 'globby'

export async function getJobs() {
  const names = await globby(['./src/**/*.e2e.ts'])
  return names.map(name => ({
    id: name,
    name: name,
    run: async () => {
      console.log('Whee!')
    }
  }))
}