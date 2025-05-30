import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { Match } from 'decorators/match.decorator';

export class RegisterUserDto {
  @ApiProperty({ required: false })
  @IsOptional()
  first_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  last_name?: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Matches(
    /^(?=.*\d)(?=.*[A-Za-z])[A-Za-z\d\s~@#$%^&*+=`|{}:;"'<>?!,./[\]-]{9,}$/,
    {
      message:
        'Password must have at least one number, one letter, and it has to be longer than 8 characters.',
    },
  )
  password: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @Match(RegisterUserDto, (field) => field.password, {
    message: 'Passwords do not match.',
  })
  confirm_password: string;
}
