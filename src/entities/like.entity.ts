import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Quote } from './quote.entity';

@Entity()
export class Like {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @Expose()
  id: string;

  @Column({ nullable: true })
  liked: boolean;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @ManyToOne(() => Quote, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'quote_id' })
  quote: Quote | null;
}
