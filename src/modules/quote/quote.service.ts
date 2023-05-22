import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
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

  async create(token: string, createQuoteDto: CreateUpdateQuoteDto): Promise<Quote>  {
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


  async findOne(id: string) {
    const quote = await this.findById(id, ['user']) as Quote
    
    let user_name: string
    if (quote.user.first_name === null || quote.user.last_name === null) {
      user_name = quote.user.email
    } else {
      user_name = quote.user.first_name + ' ' + quote.user.last_name
    }
    
    const query = await this.quotesRepository.query(`SELECT COUNT(CASE WHEN liked = true THEN 1 END) - COUNT(CASE WHEN liked = false THEN 1 END) as likes_sum FROM "like" WHERE quote_id = '${id}';`)
    const likes_sum = query[0].likes_sum
    quote.user = undefined

    return {quote, user_name, likes_number: likes_sum}
  }

  async update(id: string, updateQuoteDto: CreateUpdateQuoteDto, token: string): Promise<Quote> {
    const quote = await this.findById(id, ['user']) as Quote
    const user = await this.usersService.findLoggedInUser(token)

    if (quote.user.id !== user.id) {
      throw new BadRequestException('You can\'t edit this quote.')
    }

    quote.text = updateQuoteDto.text

    try {
      const updatedQuote = await this.quotesRepository.save(quote);
      updatedQuote.user.password = undefined
      return updatedQuote
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  async removeQuote(id: string, token: string): Promise<Quote> {
    const quote = await this.findById(id, ['user']) as Quote
    const user = await this.usersService.findLoggedInUser(token)

    if (quote.user.id !== user.id) {
      throw new BadRequestException('You can\'t delete this quote.')
    }

    return this.remove(id)
  }
}
