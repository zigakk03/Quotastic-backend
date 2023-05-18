import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { User } from 'entities/user.entity';

@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  loggedInUser(@Req() req: Request) {
    const token = req.cookies['access_token']
    return this.userService.findLoggedInUser(token);
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
  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
