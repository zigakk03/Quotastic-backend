import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'entities/user.entity';
import { AbstractService } from 'common/abstract.service';
import { compareHash, hash } from 'utils/bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Injectable()
export class UserService extends AbstractService{
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private jwtService: JwtService
    ) {
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

  async findLoggedInUser(token: string): Promise<User> {
    try {
      const decodedToken: any = this.jwtService.verify(token);
      const userId: string = decodedToken.sub;

      const user: User = {...(await this.findById(userId)), password: undefined};
      return user;
    } catch (error) {
      Logger.error(error)
      throw new BadRequestException('Something went wrong.')
    }
  }

  async updatePassword(token: string, updateUserPasswordDto: UpdateUserPasswordDto): Promise<User> {
    let user: User;
    try {
      const decodedToken: any = this.jwtService.verify(token);
      const userId: string = decodedToken.sub;

      user = await this.findById(userId);
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Something went wrong.');
    }

    const isOriginalPasswordCorrect = await compareHash(updateUserPasswordDto.password, user.password);
    if (!isOriginalPasswordCorrect) {
      throw new BadRequestException('Incorrect original password.');
    }
    if (await compareHash(updateUserPasswordDto.new_password, user.password)) {
      throw new BadRequestException('New password cannot be the same as the original password.');
    }

    user.password = await hash(updateUserPasswordDto.new_password);
    try {
      return this.usersRepository.save(user);
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  
  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
}
