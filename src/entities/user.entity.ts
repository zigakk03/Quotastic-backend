import { Expose, Exclude } from 'class-transformer';
import { IsUUID } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  @Expose()
  user_id: string;

  @Column({ unique: true, nullable: false})
  email: string;

  @Column({nullable: true})
  firstName: string;

  @Column({nullable: true})
  lastName: string;

  @Column({nullable: false})
  @Exclude()
  password: string;

  /*
  @Column({nullable: true})
  avatar: string;
  */
}
