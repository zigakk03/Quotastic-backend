import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { AbstractService } from 'common/abstract.service';
import { hash } from 'utils/bcrypt';

@Injectable()
export class UserService extends AbstractService{
  constructor(@InjectRepository(User) private readonly usersRepository: Repository<User>) {
    super(usersRepository)
  }

  async create(createUserDto: CreateUserDto) {
    const user = await this.findBy({ email: createUserDto.email })
    if (user) {
      throw new BadRequestException('User already exists.')
    }

    createUserDto.password = await hash(createUserDto.password)
    createUserDto.confirm_password = await hash(createUserDto.confirm_password)
    
    try {
      const newUser = this.usersRepository.create({ ...createUserDto,})
      return this.usersRepository.save(newUser)
    } catch (error) {
      Logger.error(error)
      throw new BadRequestException('Something went wrong.')
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} user`;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
}
