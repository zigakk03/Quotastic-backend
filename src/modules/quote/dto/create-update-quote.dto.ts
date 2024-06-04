import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateUpdateQuoteDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  text: string;
}
