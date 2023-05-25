import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
      const response = await this.usersRepository.save(newUser)
      response.password = undefined
      return response
    } catch (error) {
      Logger.error(error)
      throw new BadRequestException('Something went wrong.')
    }
  }

  async carmaAndNumberOfQuotes(id: string){
    try {
      const carmaQuery = await this.usersRepository.query(
        'SELECT COUNT(CASE WHEN liked = true THEN 1 END) - COUNT(CASE WHEN liked = false THEN 1 END) AS carma '+
        'FROM "like" l INNER JOIN quote q ON q.id = l.quote_id '+
        `WHERE q.user_id = '${id}';`)
      const carma = carmaQuery[0].carma

      const countQuery = await this.usersRepository.query(
        'SELECT COUNT(*) AS number_of_quotes '+
        'FROM quote '+
        `WHERE user_id = '${id}';`)
      const numOfQuotes = countQuery[0].number_of_quotes

      return {carma, numOfQuotes}
    } catch (error) {
      Logger.error(error)
      throw new BadRequestException('Something went wrong.')
    }
  }

  async findLoggedInUser(token: string): Promise<User> {
    try {
      const decodedToken: any = this.jwtService.verify(token);
      const userId: string = decodedToken.sub;

      return this.findById(userId);
    } catch (error) {
      Logger.error(error)
      throw new BadRequestException('Something went wrong.')
    }
  }

  async updatePassword(token: string, updateUserPasswordDto: UpdateUserPasswordDto): Promise<User> {
    const user = await this.findLoggedInUser(token);

    const isOriginalPasswordCorrect = await compareHash(updateUserPasswordDto.password, user.password);
    if (!isOriginalPasswordCorrect) {
      throw new BadRequestException('Incorrect original password.');
    }
    if (await compareHash(updateUserPasswordDto.new_password, user.password)) {
      throw new BadRequestException('New password cannot be the same as the original password.');
    }

    user.password = await hash(updateUserPasswordDto.new_password);
    try {
      return {...(await this.usersRepository.save(user)), password: undefined};
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  
  async update(token: string, updateUserDto: UpdateUserDto) {
    let change = false;
    const user = await this.findLoggedInUser(token);

    if (updateUserDto.first_name && updateUserDto.first_name !== user.first_name) {
      change = true
      user.first_name = updateUserDto.first_name
    }
    if (updateUserDto.last_name && updateUserDto.last_name !== user.last_name) {
      change = true
      user.last_name = updateUserDto.last_name
    }
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      change = true
      user.email = updateUserDto.email
    }

    if (change) {
      try {
        await this.usersRepository.save(user);
        user.password = undefined
        return user
      } catch (error) {
        if (error instanceof QueryFailedError && error.message.includes('duplicate key value violates unique constraint')) {
          Logger.error(error);
          throw new BadRequestException('This email is already in use.');
        } else {
          Logger.error(error);
          throw new InternalServerErrorException('Something went wrong.');
        }
      }
    } else {
      return 'Nothing to change.'
    }
  }

  async removeUser(token: string) {
    try {
      const decodedToken: any = this.jwtService.verify(token);
      const userId: string = decodedToken.sub;

      const user = await this.findById(userId);
      return this.remove(user.id);
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Something went wrong.');
    }
  }

  async updateUserImageId(token: string, filename: string){
    const user = await this.findLoggedInUser(token)
    user.avatar = filename
    try {
      const response = await this.usersRepository.save(user)
      response.password = undefined
      return response
    } catch (error) {
      Logger.error(error)
      throw new InternalServerErrorException('Something went wrong.')
    }
  }
}
