import { Expose } from 'class-transformer';
import { IsUUID } from 'class-validator';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Quote {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @Expose()
  id: string;

  @CreateDateColumn()
  @Expose()
  created_at: Date;

  @Column({ nullable: false })
  text: string;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;
}
