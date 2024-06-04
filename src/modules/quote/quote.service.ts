import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUpdateQuoteDto } from './dto/create-update-quote.dto';
import { AbstractService } from 'common/abstract.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from 'entities/quote.entity';
import { Repository } from 'typeorm';
import { UserService } from 'modules/user/user.service';
import { User } from 'entities/user.entity';

@Injectable()
export class QuoteService extends AbstractService {
  constructor(
    @InjectRepository(Quote)
    private readonly quotesRepository: Repository<Quote>,
    private readonly usersService: UserService,
  ) {
    super(quotesRepository);
  }

  async create(
    token: string,
    createQuoteDto: CreateUpdateQuoteDto,
  ): Promise<Quote> {
    const user: User = await this.usersService.findLoggedInUser(token);
    const quote = { text: createQuoteDto.text, user };

    try {
      const newQuote = this.quotesRepository.create(quote);
      const response = await this.quotesRepository.save(newQuote);
      response.user.password = undefined;
      return response;
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Something went wrong.');
    }
  }

  async update(
    id: string,
    updateQuoteDto: CreateUpdateQuoteDto,
    token: string,
  ): Promise<Quote> {
    const quote = (await this.findById(id, ['user'])) as Quote;
    const user = await this.usersService.findLoggedInUser(token);

    if (quote.user.id !== user.id) {
      throw new BadRequestException("You can't edit this quote.");
    }

    quote.text = updateQuoteDto.text;

    try {
      const updatedQuote = await this.quotesRepository.save(quote);
      updatedQuote.user.password = undefined;
      return updatedQuote;
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong.');
    }
  }

  async removeQuote(id: string, token: string): Promise<Quote> {
    const quote = (await this.findById(id, ['user'])) as Quote;
    const user = await this.usersService.findLoggedInUser(token);

    if (quote.user.id !== user.id) {
      throw new BadRequestException("You can't delete this quote.");
    }

    return this.remove(id);
  }
}
