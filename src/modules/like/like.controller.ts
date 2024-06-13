import { Controller, Get, Param, Put, Req } from '@nestjs/common';
import { LikeService } from './like.service';
import { Request } from 'express';
import { Public } from 'decorators/public.decorator';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Likes')
@Controller('quotes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @ApiCreatedResponse({ description: 'Upvote a quote.' })
  @Put(':id/upvote')
  upvote(@Param('id') id: string, @Req() req: Request) {
    const token = req.cookies['access_token'];
    return this.likeService.upvoteQuote(id, token);
  }

  @ApiCreatedResponse({ description: 'Downvote a quote.' })
  @Put(':id/downvote')
  downvote(@Param('id') id: string, @Req() req: Request) {
    const token = req.cookies['access_token'];
    return this.likeService.downvoteQuote(id, token);
  }

  @ApiCreatedResponse({ description: 'Finds a quote.' })
  @Public()
  @Get('one/:id')
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(id);
  }

  @ApiCreatedResponse({ description: 'Finds a random quote.' })
  @Public()
  @Get('/random')
  random(@Req() req?: Request) {
    const token = req.cookies['access_token'];
    return this.likeService.random(token);
  }

  @ApiCreatedResponse({ description: 'Gets paginated most liked quotes.' })
  @Public()
  @Get(':page')
  paginatedMostLiked(@Param('page') page: number, @Req() req?: Request) {
    const token = req.cookies['access_token'];
    return this.likeService.paginatedMostLiked(page, token);
  }

  @ApiCreatedResponse({ description: 'Gets paginated newest quotes.' })
  @Public()
  @Get('date/:page')
  paginatedDate(@Param('page') page: number, @Req() req?: Request) {
    const token = req.cookies['access_token'];
    return this.likeService.paginatedDate(page, token);
  }

  @ApiCreatedResponse({
    description: 'Gets paginated liked quotes of a specific user.',
  })
  @Public()
  @Get('user/:id/liked/:page')
  async getPaginatedLikedUserQuotes(
    @Param('id') id: string,
    @Param('page') page: number,
    @Req() req?: Request,
  ) {
    const token = await req.cookies['access_token'];
    return this.likeService.getPaginatedLikedUserQuotes(id, page, token);
  }

  @ApiCreatedResponse({
    description: 'Gets paginated newest quotes of a specific user.',
  })
  @Public()
  @Get('user/:id/rescent/:page')
  getPaginatedRescentUserQuotes(
    @Param('id') id: string,
    @Param('page') page: number,
    @Req() req?: Request,
  ) {
    const token = req.cookies['access_token'];
    return this.likeService.getPaginatedRescentUserQuotes(id, page, token);
  }

  @ApiCreatedResponse({
    description: 'Gets paginated most liked quotes of a specific user.',
  })
  @Public()
  @Get('user/:id/mostliked/:page')
  getPaginatedMostLikedUserQuotes(
    @Param('id') id: string,
    @Param('page') page: number,
    @Req() req?: Request,
  ) {
    const token = req.cookies['access_token'];
    return this.likeService.getPaginatedMostLikedUserQuotes(id, page, token);
  }
}
