import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty, Matches } from 'class-validator';
import { Match } from 'decorators/match.decorator';

export class UpdateUserPasswordDto extends PartialType(CreateUserDto) {
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @Matches(/^(?=.*\d)(?=.*[A-Za-z])[A-Za-z\d\s~@#$%^&*+=`|{}:;"'<>?!,./[\]-]{9,}$/, {
      message: 'Password must have at least one number, one letter, and it has to be longer than 8 characters.',
    })
    password: string
  
    @ApiProperty({ required: true })
    @IsNotEmpty()
    @Match(UpdateUserPasswordDto, (field) => field.password, { message: 'Passwords do not match.' })
    confirm_password: string

    @ApiProperty({ required: true })
    @IsNotEmpty()
    @Matches(/^(?=.*\d)(?=.*[A-Za-z])[A-Za-z\d\s~@#$%^&*+=`|{}:;"'<>?!,./[\]-]{9,}$/, {
      message: 'New password must have at least one number, one letter, and it has to be longer than 8 characters.',
    })
    new_password: string
}
