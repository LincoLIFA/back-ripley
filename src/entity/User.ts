import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Cuenta } from "./Cuenta";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id_user: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    rut: number;

    @OneToMany((type) => Cuenta, (cuenta) => cuenta.user)
      cuentas: Cuenta[];
}
