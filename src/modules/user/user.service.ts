import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserInputDto } from './dto/create-user-input.dto';
import { hashPassword } from 'src/shares/utils/encryption.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserInputDto: CreateUserInputDto): Promise<User> {
    const { username, password, name, email } = createUserInputDto;

    const hashedPassword = await hashPassword(password);

    const user = this.usersRepository.create({
      username,
      password: hashedPassword,
      name,
      email,
    });

    const newUser = await this.usersRepository.save(user);

    delete (newUser as Partial<User>).password;

    return newUser;
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(
    username: string,
    selectSecrets: boolean = false,
  ): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermission');

    if (selectSecrets) {
      query.addSelect('user.password');
    }

    return await query.getOne();
  }

  async findOneByID(id: number): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermission');

    return await query.getOne();
  }

  async findOneByEmail(email: string): Promise<User | null> {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('role.permissions', 'rolePermission');

    return await query.getOne();
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User | null> {
    const query = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id = :id', { id });

    const user = await query.getOne();

    if (!user) {
      return null; // atau throw new NotFoundException('User not found');
    }

    Object.assign(user, updateUserDto);

    const updatedUser = await this.usersRepository.save(user);

    delete (updatedUser as Partial<User>).password;
    return updatedUser;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
