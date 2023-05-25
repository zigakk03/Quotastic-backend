import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseInterceptors, HttpStatus, HttpCode, UploadedFile, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Request, Response } from 'express';
import { UpdateUserPasswordDto } from './dto/update-user-password.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { isFileExtensionSafe, removeFile, saveImageToStorage } from 'common/imageStorage';
import { join } from 'path';
import { User } from 'entities/user.entity';
import { Public } from 'decorators/public.decorator';

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
    const carmaAndNumberOfQuotes = await this.userService.carmaAndNumberOfQuotes(user.id)
    return {user, carma: carmaAndNumberOfQuotes.carma, quotes: carmaAndNumberOfQuotes.numOfQuotes}
  }
  
  @Public()
  @ApiCreatedResponse({ description: 'Finds a user with the given id.' })
  @Get(':id')
  async getUserWithId(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    user.password = undefined
    const carmaAndNumberOfQuotes = await this.userService.carmaAndNumberOfQuotes(id)
    return {user, carma: carmaAndNumberOfQuotes.carma, quotes: carmaAndNumberOfQuotes.numOfQuotes}
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('avatar', saveImageToStorage))
  async upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request): Promise<User> {
    const token = req.cookies['access_token'];
    const fileName = file?.filename;

    if (!fileName) {
      throw new BadRequestException('File must be a png, jpg, or jpeg.');
    }

    const imagesFolderPath = join(process.cwd(), 'files');
    const fullImagePath = join(imagesFolderPath, file.filename);
    

    if (await isFileExtensionSafe(fullImagePath)) {
      return this.userService.updateUserImageId(token, fileName);
    }

    removeFile(fullImagePath);
    throw new BadRequestException('File is unsafe');
  }
}
