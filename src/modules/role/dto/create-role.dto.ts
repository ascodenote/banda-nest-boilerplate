import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber } from 'class-validator';
import { ClientRole } from '../role.enum';

export class CreateRoleDto {
  @ApiProperty({ example: 'Client' })
  @IsEnum(ClientRole)
  name: ClientRole;

  @ApiProperty({ example: '999' })
  @IsNumber()
  rank?: number;
}
