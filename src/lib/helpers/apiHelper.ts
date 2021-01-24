import ApiValidationDoc from 'api-validate-doc';

import packageJson from '../../../package.json';

const apiHelper = new ApiValidationDoc({
  info: {
    title: 'begin0dev-blog-api',
    version: packageJson.version,
    description: 'node express server for begin0dev blog',
  },
  filePath: './src/swagger/index.json',
});

export default apiHelper;
