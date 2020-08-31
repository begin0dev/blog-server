import faker from 'faker';

const MockUser = () => ({
  email: faker.internet.email(),
  displayName: faker.internet.userName(),
  profileImageUrl: faker.internet.url(),
});


export default MockUser;
