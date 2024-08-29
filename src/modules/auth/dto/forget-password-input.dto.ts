import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class ForgetPasswordInputDto {
  @ApiProperty({ example: 'test@mail.com' })
  @IsNotEmpty()
  email: string;
}
