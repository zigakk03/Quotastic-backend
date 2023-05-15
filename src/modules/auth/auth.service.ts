import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { compareHash, hash } from 'src/utils/bcrypt';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from 'src/entities/user.entity';
import {UserService} from 'src/modules/user/user.service'
import { JwtService } from '@nestjs/jwt'


@Injectable()
export class AuthService {
  constructor(private userService: UserService, private jwtService: JwtService) {}

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    //hash

    return await this.userService.create({
      ...registerUserDto,
    })
  }

  async validateUser(email: string, password: string): Promise<User> {
    Logger.warn('Validating user...')
    const user = await this.userService.findBy({ email: email })
    if (!user) {
      throw new BadRequestException('Invalid credentials')
    }
    if (!(await compareHash(password, user.password))) {
      throw new BadRequestException('Invalid credentials')
    }

    Logger.warn('User is valid.')
    return user
  }
}
