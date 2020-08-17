import bcrypt from 'bcrypt';

const saltRounds: number = 12;

export const generatePassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(saltRounds);
  return bcrypt.hash(password, salt);
};

export const comparePassword = (password: string, hash: string): Promise<boolean> => bcrypt.compare(password, hash);
