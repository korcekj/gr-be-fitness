import { USER_ROLE } from '../utils/enums';

declare global {
  namespace Express {
    interface Locals {
      user: {
        id: string;
        role: USER_ROLE;
      } | null;
    }
  }
}

export {};
