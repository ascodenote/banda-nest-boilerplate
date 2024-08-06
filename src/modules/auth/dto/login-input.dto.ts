import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginInputDto {
  @ApiProperty({ example: 'aba1' })
  @IsString()
  username: string;

  @ApiProperty({ example: '123' })
  @IsString()
  password: string;
}
