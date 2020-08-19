declare global {
  namespace Express {
    export interface Request {
      jsend: Jsend;
    }
  }

  export interface ExpressError extends Error{
    status?: Number;
  }
}

type Jsend<D, M> = ({ message, data, meta }: { message?: string; data?: D; meta?: M }) => void;
