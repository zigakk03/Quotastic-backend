import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('me')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({ description: 'Create a new user.' })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @ApiCreatedResponse({ description: 'Gets the logged in user info.' })
  @Get()
  async loggedInUser(@Req() req: Request) {
    const token = req.cookies['access_token']
    const user = await this.userService.findLoggedInUser(token);
    user.password = undefined
    return user
  }

  @ApiCreatedResponse({ description: 'Finds a user with the given id.' })
  @Get('find/:id')
  findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @ApiCreatedResponse({ description: 'Updates the password of signed in the user.' })
  @Patch('update-password')
  updatePassword(@Body() updateUserPasswordDto: UpdateUserPasswordDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.userService.updatePassword(token, updateUserPasswordDto);
  }
  
  @ApiCreatedResponse({ description: 'Updates the email, first name, or last name of the signed in user.' })
  @Patch('update')
  update(@Body() updateUserDto: UpdateUserDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.userService.update(token, updateUserDto);
  }
  
  @ApiCreatedResponse({ description: 'Deletes and signs out the user.' })
  @Delete('delete')
  remove(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = req.cookies['access_token']
    res.clearCookie('access_token');
    return this.userService.removeUser(token);
  }
}
