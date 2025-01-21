import { UserModel } from '../db/user';
import { USER_ROLE } from '../utils/enums';

declare global {
  namespace Express {
    interface Locals {
      user: UserModel | null;
    }
  }
}

export {};
