const faker = require('faker');

const MockUserData = () => {
  return {
    email: faker.internet.email(),
    password: faker.internet.password(),
    displayName: faker.internet.userName(),
  };
};

module.exports = MockUserData;
