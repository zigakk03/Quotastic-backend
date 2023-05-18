import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateUpdateQuoteDto } from './dto/create-update-quote.dto';
import { AbstractService } from 'common/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from 'entities/quote.entity';
import { Repository } from 'typeorm';
import { UserService } from 'modules/user/user.service';
import { User } from 'entities/user.entity';

@Injectable()
export class QuoteService extends AbstractService{
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    private readonly usersService: UserService
  ) {
    super(quotesRepository);
  }

  async create(token: string, createQuoteDto: CreateUpdateQuoteDto) {
    const user: User = await this.usersService.findLoggedInUser(token)
    const quote = {text: createQuoteDto.text, user}

    try {
    const newQuote = this.quotesRepository.create(quote)
    return await this.quotesRepository.save(newQuote)
    } catch (error) {
    Logger.error(error)
    throw new BadRequestException('Something went wrong.')
    }
  }


  findOne(id: number) {
    return `This action returns a #${id} quote`;
  }

  update(id: number, updateQuoteDto: CreateUpdateQuoteDto) {
    return `This action updates a #${id} quote`;
  }
}
