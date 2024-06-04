import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'common/abstract.service';
import { Like } from 'entities/like.entity';
import { Quote } from 'entities/quote.entity';
import { User } from 'entities/user.entity';
import { query } from 'express';
import { QuoteService } from 'modules/quote/quote.service';
import { UserService } from 'modules/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class LikeService extends AbstractService {
  constructor(
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    private readonly usersService: UserService,
    private readonly quoteService: QuoteService,
  ) {
    super(likesRepository);
  }

  async upvoteQuote(id: string, token: string): Promise<Like> {
    const user = (await this.usersService.findLoggedInUser(token)) as User;
    const quote = (await this.quoteService.findById(id, ['user'])) as Quote;

    if (user.id === quote.user.id) {
      throw new BadRequestException("You can't like your own quote.");
    }

    try {
      const result = await this.likesRepository.query(`
            SELECT *
            FROM "like"
            WHERE (user_id = '${user.id}')AND(quote_id = '${quote.id}') LIMIT 1;`);

      if (result.length <= 0) {
        const newLike = new Like();
        newLike.liked = true;
        newLike.quote = quote;
        newLike.user = user;
        const createdNewLike = await this.likesRepository.create(newLike);
        const response = await this.likesRepository.save(createdNewLike);
        response.quote = undefined;
        response.user = undefined;
        return response;
      } else {
        const like = await this.findById(result[0].id);
        if (like.liked) {
          like.liked = null;
        } else {
          like.liked = true;
        }
        return await this.likesRepository.save(like);
      }
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Something went wrong.');
    }
  }

  async downvoteQuote(id: string, token: string): Promise<Like> {
    const user = (await this.usersService.findLoggedInUser(token)) as User;
    const quote = (await this.quoteService.findById(id, ['user'])) as Quote;

    if (user.id === quote.user.id) {
      throw new BadRequestException("You can't dislike your own quote.");
    }

    try {
      const result = await this.likesRepository.query(
        `SELECT id FROM "like" WHERE (user_id = '${user.id}')AND(quote_id = '${quote.id}') LIMIT 1;`,
      );

      if (result.length <= 0) {
        const newLike = new Like();
        newLike.liked = false;
        newLike.quote = quote;
        newLike.user = user;
        const createdNewLike = this.likesRepository.create(newLike);
        const response = await this.likesRepository.save(createdNewLike);
        response.quote = undefined;
        response.user = undefined;
        return response;
      } else {
        const like = await this.findById(result[0].id);
        if (like.liked === null || like.liked === true) {
          like.liked = false;
        } else {
          like.liked = null;
        }
        return await this.likesRepository.save(like);
      }
    } catch (error) {
      Logger.error(error);
      throw new BadRequestException('Something went wrong.');
    }
  }

  async findOne(id: string, token?: string) {
    let activeUserLiked: boolean = null;
    let activeUser;
    if (token) {
      activeUser = (await this.usersService.findLoggedInUser(token)) as User;
      const query = await this.likesRepository.query(
        `SELECT liked FROM "like" WHERE (user_id='${activeUser.id}') AND (quote_id='${id}')`,
      );
      if (query.length > 0) {
        activeUserLiked = query[0].liked;
      }
    }

    const quote = (await this.quoteService.findById(id, ['user'])) as Quote;

    let user_name: string;
    if (
      quote.user.first_name === null ||
      quote.user.first_name === '' ||
      quote.user.last_name === null ||
      quote.user.last_name === ''
    ) {
      user_name = quote.user.email;
    } else {
      user_name = quote.user.first_name + ' ' + quote.user.last_name;
    }

    const query = await this.likesRepository.query(
      `SELECT COUNT(CASE WHEN liked = true THEN 1 END) - COUNT(CASE WHEN liked = false THEN 1 END) as likes_sum FROM "like" WHERE quote_id = '${id}';`,
    );
    const likes_sum = query[0].likes_sum;
    const avatar = quote.user.avatar;
    const user_id = quote.user.id;
    quote.user = undefined;

    return {
      quote,
      user: { user_id, user_name, avatar },
      likes_number: likes_sum,
      activeUserLiked,
    };
  }

  async random(token?: string) {
    const query = await this.likesRepository.query(
      'SELECT id FROM quote ORDER BY RANDOM() LIMIT 1;',
    );
    return await this.findOne(query[0].id, token);
  }

  async paginatedMostLiked(page: number, token?: string) {
    const take = 9;
    const skip = (page - 1) * take;

    try {
      const query = await this.likesRepository.query(
        'SELECT q.id, COUNT(CASE WHEN liked = true THEN 1 END) - COUNT(CASE WHEN liked = false THEN 1 END) as likes_sum ' +
          'FROM quote q LEFT OUTER JOIN "like" l ON q.id = l.quote_id ' +
          'GROUP BY q.id ' +
          'ORDER BY likes_sum DESC;',
      );
      const total = query.length;

      const data = [];
      for (let i = skip; i < total && i < skip + take; i++) {
        const result = await this.findOne(query[i].id, token);
        data.push(result);
      }

      return {
        data,
        meta: { total, page, last_page: Math.ceil(total / take) },
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async paginatedDate(page: number, token?: string) {
    const take = 9;
    const skip = (page - 1) * take;

    try {
      const query = await this.likesRepository.query(
        'SELECT q.id ' + 'FROM quote q ' + 'ORDER BY q.created_at DESC;',
      );
      const total = query.length;

      const data = [];
      for (let i = skip; i < total && i < skip + take; i++) {
        const result = await this.findOne(query[i].id, token);
        data.push(result);
      }

      return {
        data,
        meta: { total, page, last_page: Math.ceil(total / take) },
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getPaginatedLikedUserQuotes(id: string, page: number, token?: string) {
    const take = 4;
    const skip = (page - 1) * take;

    try {
      const query = await this.likesRepository.query(
        `SELECT quote_id
                FROM "like"
                WHERE user_id = '${id}'`,
      );
      const total = query.length;

      const data = [];
      for (let i = skip; i < total && i < skip + take; i++) {
        const result = await this.findOne(query[i].quote_id, token);
        data.push(result);
      }

      return {
        data,
        meta: { total, page, last_page: Math.ceil(total / take) },
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getPaginatedRescentUserQuotes(
    id: string,
    page: number,
    token?: string,
  ) {
    const take = 4;
    const skip = (page - 1) * take;

    try {
      const query = await this.likesRepository.query(
        `SELECT id
                FROM quote
                WHERE user_id='${id}'
                ORDER BY created_at DESC`,
      );
      const total = query.length;

      const data = [];
      for (let i = skip; i < total && i < skip + take; i++) {
        const result = await this.findOne(query[i].id, token);
        data.push(result);
      }

      return {
        data,
        meta: { total, page, last_page: Math.ceil(total / take) },
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }

  async getPaginatedMostLikedUserQuotes(
    id: string,
    page: number,
    token?: string,
  ) {
    const take = 4;
    const skip = (page - 1) * take;

    try {
      const query = await this.likesRepository.query(
        `SELECT q.id, COUNT(CASE WHEN liked = true THEN 1 END) - COUNT(CASE WHEN liked = false THEN 1 END) as carma
                FROM "like" l RIGHT OUTER JOIN quote q ON q.id = l.quote_id
                WHERE q.user_id = '${id}'
                GROUP BY q.id
                ORDER BY carma DESC;`,
      );
      const total = query.length;

      const data = [];
      for (let i = skip; i < total && i < skip + take; i++) {
        const result = await this.findOne(query[i].id, token);
        data.push(result);
      }

      return {
        data,
        meta: { total, page, last_page: Math.ceil(total / take) },
      };
    } catch (error) {
      Logger.error(error);
      throw new InternalServerErrorException('Something went wrong');
    }
  }
}
