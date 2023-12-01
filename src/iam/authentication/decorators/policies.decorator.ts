import { SetMetadata } from '@nestjs/common';
import { Policy } from '../policies/interfaces/policy.interface';

export const POLICIES_KEY = 'policies';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Policies = (...policies: Policy[]) =>
  SetMetadata(POLICIES_KEY, policies);
