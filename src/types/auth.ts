export interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}
export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
  };
}
