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
            throw new BadRequestException('You can\'t like your own quote.')
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
                if (like.liked === null) {
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
}
