import { IsEmail, MaxLength, MinLength, Validate } from 'class-validator';
import { PasswordValidator } from 'common';

export class SignInDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  @MaxLength(64)
  @Validate(PasswordValidator)
  password: string;
}
