module.exports = {
  extends: "airbnb-base",
  plugins: ["jest"],
  settings: {
    "import/resolver": {
      node: {
        paths: ["src"]
      }
    }
  },
  env: {
    "jest/globals": true
  },
  rules: {
    "arrow-body-style": 0,
    "consistent-return": 0,
    "object-property-newline": 0,
    "object-curly-newline": 0,
    "import/no-extraneous-dependencies": 0,
    "import/prefer-default-export": 0,
    "no-console": 0,
    "no-underscore-dangle": [
      "error",
      {
        allow: ["_id"]
      }
    ],
    "max-len": 0
  }
};
