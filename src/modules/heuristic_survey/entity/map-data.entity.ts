import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: 'admin0' })
export class Admin0 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    admin_0_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    object_id: string;
}


@Entity({ name: 'admin1' })
export class Admin1 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    admin_1_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    admin_0_fk_id: number;

    @Column()
    object_id: string;
}

@Entity({ name: 'admin2' })
export class Admin2 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    admin_2_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    admin_1_fk_id: number;

    @Column()
    object_id: string;
}

@Entity({ name: 'admin3' })
export class Admin3 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    admin_3_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    admin_2_fk_id: number;

    @Column()
    object_id: string;

    @Column()
    type: number; //1 => subdistrict 2 => city
}

@Entity({ name: 'admin4' })
export class Admin4 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    admin_4_name: string;

    @Column()
    admin_1_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    admin_3_fk_id: number;

    @Column()
    object_id: string;

    @Column()
    type: number; //1 => village 2 => Ward
}