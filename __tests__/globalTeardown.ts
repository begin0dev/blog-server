import apiHelper from '../src/lib/helpers/api-helper';

module.exports = (): null => {
  apiHelper.writeOpenApi();
  return null;
};
