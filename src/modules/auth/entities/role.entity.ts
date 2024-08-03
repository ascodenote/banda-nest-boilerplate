import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Permission } from './permission.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { ClientRole } from '../enums/role.enum';

@Entity()
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: ClientRole;

  @Column({ type: 'integer', default: 999 })
  rank: number;

  @ManyToMany(() => User, (user) => user.roles)
  users?: User[];

  @ManyToMany(() => Permission)
  @JoinTable()
  permissions?: Permission[];
}
