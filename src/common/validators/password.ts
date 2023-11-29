import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import {
  PASSWORD_FORMAT_IS_NOT_CORRECT,
  REGX_PASSWORD,
} from '../common.constants';

@ValidatorConstraint({ name: 'password', async: false })
export class PasswordValidator implements ValidatorConstraintInterface {
  validate(password: string) {
    const regexPasswordPattern = REGX_PASSWORD;
    return regexPasswordPattern.test(password);
  }

  defaultMessage() {
    return PASSWORD_FORMAT_IS_NOT_CORRECT;
  }
}
