import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { QuoteService } from './quote.service';
import { CreateUpdateQuoteDto } from './dto/create-update-quote.dto';
import { Request } from 'express';

@Controller()
export class QuoteController {
  constructor(private readonly quoteService: QuoteService) {}

  @Post('me/myquote')
  create(@Body() createQuoteDto: CreateUpdateQuoteDto, @Req() req: Request) {
    const token = req.cookies['access_token']
    return this.quoteService.create(token, createQuoteDto);
  }

  @Get()
  findAll() {
    return this.quoteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quoteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuoteDto: CreateUpdateQuoteDto) {
    return this.quoteService.update(+id, updateQuoteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quoteService.remove(id);
  }
}
