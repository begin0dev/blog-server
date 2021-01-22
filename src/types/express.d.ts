import { UserJson } from '@app/database/models/user';

export module 'express-serve-static-core' {
  export interface Request {
    user: UserJson;
  }
  export interface Response {
    setCookie(key: string, value: string): this;
    deleteCookie(key: string): this;
  }
}
