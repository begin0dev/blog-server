const faker = require('faker');

const MockUserData = () => {
  return {
    displayName: faker.internet.userName(),
    profileImageUrl: faker.internet.url(),
  };
};

module.exports = MockUserData;
