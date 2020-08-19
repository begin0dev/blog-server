declare global {
  module 'express-serve-static-core' {
    interface Response {
      jsend<D, M>(params: { message?: string; data?: D; meta?: M }): this;
    }
    export interface ExpressError extends Error {
      status?: number;
    }
  }
}
