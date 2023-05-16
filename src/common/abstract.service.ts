import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common'
import { PaginatedResult } from 'common/interfaces/paginated-result.interface'
import { Repository } from 'typeorm'

@Injectable()
export abstract class AbstractService {
  constructor(protected readonly repository: Repository<any>) {}

  async findAll(relations = []): Promise<any[]> {
    try {
      return this.repository.find({ relations })
    } catch (error) {
      Logger.error(error)
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async findBy(condition, relations = []): Promise<any> {
    try {
      return this.repository.findOne({ where: condition, relations })
    } catch (error) {
      Logger.error(error)
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async findById(id: string, relations = []): Promise<any> {
    try {
      const element = await this.repository.findOne({ where: { id }, relations })

      if (!element) {
        throw new BadRequestException('Cannot find element')
      }
      return element
    } catch (error) {
      Logger.error(error)
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async remove(id: string): Promise<any> {
    const elem = await this.findById(id)
    try {
      return this.repository.remove(elem)
    } catch (error) {
      Logger.error(error)
      throw new InternalServerErrorException('Something went wrong')
    }
  }

  async paginate(page = 1, relations = []): Promise<PaginatedResult> {
    const take = 10

    try {
      const [data, total] = await this.repository.findAndCount({
        take,
        skip: (page - 1) * take,
        relations,
      })

      return {
        data: data,
        meta: {
          total,
          page,
          last_page: Math.ceil(total / take),
        },
      }
    } catch (error) {
      Logger.error(error)
      throw new InternalServerErrorException('Something went wrong')
    }
  }
}
