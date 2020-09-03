export enum Status {
  SUCCESS = 'success',
  FAIL = 'fail',
  ERROR = 'error'
}

export class ExpressError extends Error {
  status?: number;
}
