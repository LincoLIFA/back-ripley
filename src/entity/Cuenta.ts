import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from "typeorm";
import { User } from "./User";

@Entity()
export class Cuenta {

    @PrimaryGeneratedColumn()
    id_cuenta: number;

    @Column()
    tipo: string;

    @Column()
    numero_cuenta: number;

    @Column()
    saldo: number;

  @ManyToOne((type) => User, (user) => user.cuentas)
  @JoinColumn({ name: 'id_user' })
    user: User;
}
