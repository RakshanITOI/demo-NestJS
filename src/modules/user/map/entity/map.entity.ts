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
@Entity()
export class Country {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    country_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    object_id: string;
}


@Entity()
export class State {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    state_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    country_id: number;

    @Column()
    object_id: string;
}

@Entity()
export class District {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    district_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    state_id: number;

    @Column()
    object_id: string;
}

@Entity({ name: 'subdistrict' })
export class SubDistrict {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    subdistrict_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    district_id: number;

    @Column()
    object_id: string;
}

@Entity()
export class Village {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    village_name: string;

    @Column()
    state_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    subdistrict_id: number;

    @Column()
    object_id: string;
}
@Entity({name:'city'})
export class City {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    city_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    district_id: number;

    @Column()
    object_id: string;
}
@Entity()
export class Ward {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ward_name: string;

    @Column()
    geometries: string;

    @Column()
    properties: string;

    @Column()
    city_id: number;

    @Column()
    state_name: string;

    @Column()
    object_id: string;
}