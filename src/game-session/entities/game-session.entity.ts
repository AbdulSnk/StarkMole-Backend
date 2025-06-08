import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { InputEvent } from './input-event.entity';
import { Challenge } from 'src/challenge/entities/challenge.entity';

@Entity('game_sessions')
@Index(['userId', 'createdAt'])
@Index(['challengeId', 'createdAt'])
export class GameSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid')
  @Index()
  challengeId: string;

  @Column('integer', { default: 0 })
  score: number;

  @Column('integer', { comment: 'Duration in milliseconds' })
  duration: number;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;

  @Column('varchar', { length: 64 })
  sessionHash: string; // For integrity verification

  @Column('boolean', { default: false })
  isVerified: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.gameSessions)
  user: User;

  @ManyToOne(() => Challenge, (challenge) => challenge.gameSessions)
  challenge: Challenge;

  @OneToMany(() => InputEvent, (inputEvent) => inputEvent.gameSession, {
    cascade: true,
  })
  inputs: InputEvent[];
}
