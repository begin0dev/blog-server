import Server from '@app/server';
import apiHelper from '@app/lib/helpers/api-helper';

describe('apiHelper', () => {
  test('generator', async () => {
    await apiHelper.generatorDoc(Server.application);
  });
});
