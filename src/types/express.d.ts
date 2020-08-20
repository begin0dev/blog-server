export module 'express-serve-static-core' {
  interface Response {
    jsend<D, M>(params: { message?: string; data?: D; meta?: M }): this;
  }
}
