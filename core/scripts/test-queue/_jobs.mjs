import { globby } from 'globby';
import execa from 'execa';

export async function getJobs() {
  const names = await globby(['./src/**/*.e2e.ts']);
  return names.map((name) => ({
    id: name,
    name: name,
    run: async () => {
      await execa('npx', ['playwright', 'test', name], {
        stdio: 'inherit',
        timeout: 180e3,
      });
    },
  }));
}
