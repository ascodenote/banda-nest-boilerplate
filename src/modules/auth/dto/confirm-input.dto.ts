import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ConfirmInputDto {
  @ApiProperty()
  @IsNotEmpty()
  hash: string;
}
