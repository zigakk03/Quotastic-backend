import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from 'common/abstract.service';
import { Like } from 'entities/like.entity';
import { Quote } from 'entities/quote.entity';
import { User } from 'entities/user.entity';
import { QuoteService } from 'modules/quote/quote.service';
import { UserService } from 'modules/user/user.service';
import { Repository } from 'typeorm';

@Injectable()
export class LikeService extends AbstractService{
    constructor(
        @InjectRepository(Like)
        private readonly likesRepository: Repository<Like>,
        private readonly usersService: UserService,
        private readonly quoteService: QuoteService
    ) {
        super(likesRepository);
    }

    async upvoteQuote (id: string, token: string): Promise<Like> {
        const user = await this.usersService.findLoggedInUser(token) as User
        const quote = await this.quoteService.findById(id,['user']) as Quote

        if (user.id === quote.user.id) {
            throw new BadRequestException('You can\'t like your own quote.')
        }
        
        try {
            const result = await this.likesRepository.query(`SELECT id FROM "like" WHERE (user_id = '${user.id}')AND(quote_id = '${quote.id}') LIMIT 1;`)
            
            if (result.length <= 0) {
                const newLike = new Like
                newLike.liked = true
                newLike.quote = quote
                newLike.user = user
                const createdNewLike = this.likesRepository.create(newLike)
                const response = await this.likesRepository.save(createdNewLike)
                response.quote = undefined
                response.user = undefined
                return response
            } else {
                const like = await this.findById(result.id)
                if (like.liked) {
                    like.liked = null
                } else {
                    like.liked = true
                }
                return await this.likesRepository.save(like)
            }
        } catch (error) {
            Logger.error(error)
            throw new BadRequestException('Something went wrong.')
        }
    }
    
    
    async downvoteQuote (id: string, token: string): Promise<Like> {
        const user = await this.usersService.findLoggedInUser(token) as User
        const quote = await this.quoteService.findById(id,['user']) as Quote

        if (user.id === quote.user.id) {
            throw new BadRequestException('You can\'t dislike your own quote.')
        }
        
        try {
            const result = await this.likesRepository.query(`SELECT id FROM "like" WHERE (user_id = '${user.id}')AND(quote_id = '${quote.id}') LIMIT 1;`)
            
            if (result.length <= 0) {
                const newLike = new Like
                newLike.liked = false
                newLike.quote = quote
                newLike.user = user
                const createdNewLike = this.likesRepository.create(newLike)
                const response = await this.likesRepository.save(createdNewLike)
                response.quote = undefined
                response.user = undefined
                return response
            } else {
                const like = await this.findById(result.id)
                if (like.liked === null || like.liked === true) {
                    like.liked = false
                } else {
                    like.liked = null
                }
                return await this.likesRepository.save(like)
            }
        } catch (error) {
            Logger.error(error)
            throw new BadRequestException('Something went wrong.')
        }
    }

    async findOne(id: string) {
        const quote = await this.quoteService.findById(id, ['user']) as Quote
        
        let user_name: string
        if (quote.user.first_name === null || quote.user.first_name === '' || quote.user.last_name === null || quote.user.last_name === '') {
          user_name = quote.user.email
        } else {
          user_name = quote.user.first_name + ' ' + quote.user.last_name
        }
        
        const query = await this.likesRepository.query(`SELECT COUNT(CASE WHEN liked = true THEN 1 END) - COUNT(CASE WHEN liked = false THEN 1 END) as likes_sum FROM "like" WHERE quote_id = '${id}';`)
        const likes_sum = query[0].likes_sum
        quote.user = undefined
    
        return {quote, user_name, likes_number: likes_sum}
      }
}
