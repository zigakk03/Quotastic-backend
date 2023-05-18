import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  async loggedInUser(@Req() req: Request) {
    const token = req.cookies['access_token']
    const user = await this.userService.findLoggedInUser(token);
    user.password = undefined
    return user
  }

  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Patch('update-password')
  updatePassword(@Body() updateUserPasswordDto: UpdateUserPasswordDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.userService.updatePassword(token, updateUserPasswordDto);
  }
  
  @Patch('update')
  update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.userService.update(token, updateUserDto);
  }
  
  @Delete('delete')
  remove(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['access_token']
    res.clearCookie('access_token');
    return this.userService.removeUser(token);
  }
}
