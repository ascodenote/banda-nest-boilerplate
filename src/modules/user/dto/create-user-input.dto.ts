import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserInputDto {
  @ApiProperty({ example: 'aba1' })
  @IsString()
  username: string;

  @ApiProperty({ example: '123' })
  @IsString()
  password: string;

  @ApiProperty({ example: 'Jhon Doe' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'test@mail.com' })
  @IsString()
  email: string;
}
