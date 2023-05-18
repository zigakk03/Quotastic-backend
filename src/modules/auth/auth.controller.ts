import { Controller, HttpStatus, Body, HttpCode, Post, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import {Public} from 'decorators/public.decorator'
import { User } from 'entities/user.entity';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RequestWithUser } from 'common/interfaces/auth.interface';
import { Response } from 'express';

@ApiTags('Auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({ description: 'Signup a new user.' })
  @Public()
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() body: RegisterUserDto): Promise<User> {
    return this.authService.register(body)
  }

  @ApiCreatedResponse({ description: 'Login as an existing user.' })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: RequestWithUser, @Res({ passthrough: true }) res: Response): Promise<User> {
    const access_token = await this.authService.generateJwt(req.user)
    res.cookie('access_token', access_token, { httpOnly: true })
    return req.user
  }

  @ApiCreatedResponse({ description: 'Logs out the user.' })
  @Post('signout')
  @HttpCode(HttpStatus.OK)
  async signout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token');
  }
}
