import { Controller, Get, Param, Put, Req } from '@nestjs/common';
import { LikeService } from './like.service';
import { Request } from 'express';
import { Public } from 'decorators/public.decorator';

@Controller('quotes')
export class LikeController {
  constructor(private readonly likeService: LikeService) {}

  @Put(':id/upvote')
  upvote (@Param('id') id: string, @Req() req: Request){
    const token = req.cookies['access_token']
    return this.likeService.upvoteQuote(id, token)
  }
  
  @Put(':id/downvote')
  downvote (@Param('id') id: string, @Req() req: Request){
    const token = req.cookies['access_token']
    return this.likeService.downvoteQuote(id, token)
  }
  
  @Public()
  @Get('one/:id')
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(id);
  }
  
  @Public()
  @Get('/random')
  random() {
    return this.likeService.random();
  }

  @Public()
  @Get(':page')
  paginatedMostLiked(@Param('page') page: number) {
    return this.likeService.paginatedMostLiked(page)
  }
  
  @Public()
  @Get('date/:page')
  paginatedDate(@Param('page') page: number) {
    return this.likeService.paginatedDate(page)
  }
  
  @Public()
  @Get('user/:id/liked/:page')
  getPaginatedLikedUserQuotes(@Param('id') id: string, @Param('page') page: number){
    return this.likeService.getPaginatedLikedUserQuotes(id, page)
  }
  
  @Public()
  @Get('user/:id/rescent/:page')
  getPaginatedRescentUserQuotes(@Param('id') id: string, @Param('page') page: number){
    return this.likeService.getPaginatedRescentUserQuotes(id, page)
  }
  
  @Public()
  @Get('user/:id/mostliked/:page')
  getPaginatedMostLikedUserQuotes(@Param('id') id: string, @Param('page') page: number){
    return this.likeService.getPaginatedMostLikedUserQuotes(id, page)
  }
}
