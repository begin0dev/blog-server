import { UserJson } from '@app/database/models/user';

export module 'express-serve-static-core' {
  interface Request {
    user: UserJson;
    validParams: any;
  }
  interface Response {
    jsend<D, M>(params: { message?: string; data?: D; meta?: M }): this;
  }
}
