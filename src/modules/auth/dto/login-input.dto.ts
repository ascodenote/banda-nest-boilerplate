import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginInputDto {
  @ApiProperty({ example: 'test@mail.com' })
  @IsString()
  email: string;

  @ApiProperty({ example: '123' })
  @IsString()
  password: string;
}
