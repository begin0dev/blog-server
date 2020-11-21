import { UserJson } from '@app/database/models/user';

export module 'express-serve-static-core' {
  interface Request {
    user: UserJson;
  }
  interface Response {
    // jsend<D, M>(params: { status: 'success'|'fail'|'error'; message?: string; data?: D; meta?: M }): this;
    setCookie(key: string, value: string): this;
    deleteCookie(key: string): this;
  }
}
