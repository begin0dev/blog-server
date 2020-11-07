import faker from 'faker';

export const mockPost = (userId: string) => ({
  userId,
  isTemp: faker.random.boolean(),
  category: faker.random.arrayElement(['react', 'node', 'javascript', 'etc']),
  title: faker.lorem.sentence(),
  content: faker.lorem.text(),
  thumbnail: faker.image.imageUrl(),
  tags: [faker.lorem.word()],
});
