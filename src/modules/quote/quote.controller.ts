import { Controller, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateUpdateQuoteDto } from './dto/create-update-quote.dto';
import { Request } from 'express';

@Controller('me/myquote')
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post('')
  create(@Body() createQuoteDto: CreateUpdateQuoteDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.quoteService.create(token, createQuoteDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: CreateUpdateQuoteDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.quoteService.update(id, updateQuoteDto, token);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.quoteService.removeQuote(id, token);
  }
}
