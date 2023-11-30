import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from 'users/enums/role.enum';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ enum: Role, default: Role.User })
  role: Role;
}
