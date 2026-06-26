import * as dotenv from 'dotenv';

dotenv.config();
export const jwtConstants = {
  accessSecret: process.env.NEXT_PUBLIC_JWT_SECRET as string,
};
