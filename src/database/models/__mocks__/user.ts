import faker from 'faker';

const MockUser = () => {
  return {
    displayName: faker.internet.userName(),
    profileImageUrl: faker.internet.url(),
  };
};

export default MockUser;
