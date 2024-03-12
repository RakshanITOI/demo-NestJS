import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { lastValueFrom } from "rxjs";
import { DataSource, Repository } from "typeorm";
import { Admin0, Admin1, Admin2, Admin3, Admin4 } from "./entity/map-data.entity";
import { MongoClient } from "mongodb";
import { delay, writeCSV } from "src/helper/utility";
import { writeFileSync } from "fs";
import axiosRetry from "axios-retry";
import axios from "axios";
import { features } from "process";
// import { delay } from "../helper/utility";

const jsonMinify = require('jsonminify');

@Injectable()
export class HeuristicSurveyService {

    total_church_count = 0;

    constructor(
        @InjectRepository(Admin0)
        private admin0Repository: Repository<Admin0>,
        @InjectRepository(Admin1)
        private admin1Repository: Repository<Admin1>,
        @InjectRepository(Admin2)
        private admin2Repository: Repository<Admin2>,
        @InjectRepository(Admin3)
        private admin3Repository: Repository<Admin3>,
        @InjectRepository(Admin4)
        private admin4Repository: Repository<Admin4>,
        @InjectDataSource()
        private dataSource: DataSource,
        private http: HttpService,
    ) { }

    async surveyAndStatsWard(admin0, admin1, admin2, admin3, admin4, polygon, features, object_id) {
        // try {
        const churchList = [];
        console.log(`admin0: ${admin0}, admin1: ${admin1}, admin2: ${admin2}, admin3: ${admin3}, admin4: ${admin4}`);

        const client = await MongoClient.connect('mongodb://127.0.0.1:27017/iif-local');
        const db = client.db('iif-local');
        const churchCollection = await db.collection('google_state_churches')
            .find({ "properties.admin2": admin2 })
            .toArray();
        const uniqueChurches = await this.removeDuplicate(churchCollection || []) || [];

        for (const church of uniqueChurches) {
            const latlng = { lat: church.geometry.coordinates[1], lng: church.geometry.coordinates[0] }
            const churchLocation = latlng;
            const isInside = await this.isMarkerInsidePolygon(churchLocation, polygon);

            if (isInside) {
                churchList.push(church);
            }
        }

        const surveyRes = await this.saveSurvey(features, churchList).then(async (res) => {
            if (res)
                await this.saveStatsWard(object_id, features, churchList);
        })
        this.total_church_count += churchList.length;
        console.log(`Final Result churches: ${churchList.length}, totalCount: ${this.total_church_count} | ${admin2} | ${admin3} | ${admin4}`);

        client.close();
        return { success: true, message: 'Survey and stats saved successfully.' };
        // } catch (error) {
        //     console.log('Error in surveyAndStats:', error);
        //     return Promise.reject('Error in surveyAndStats.');
        // }
    }


    async saveSurvey(features: any, churchList: any = []): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const apiPayload = await this.payload(features, churchList);
                console.log(' Save called', `${apiPayload.survey.admin3} | ${apiPayload.survey.admin4} |${apiPayload.newChurches?.length} `)
                const url = `http://192.168.29.106:8080/api/encuesta/create`;
                const headersRequest = {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhbnNsaW5qZW5pc2hhIiwiYXV0aCI6Ik9SR19BRE1JTixPUkdfVVNFUixST0xFX0FETUlOIiwiZXhwIjoxNjk3MzQ3Nzg1fQ.j5xUAHTRZA-RDgDItl4KGy_D9JLjt69ZYVqmx7oQQpzNDrgxOUQKNdplNzqDpnLFzJWddYySENGnRGOctRQ8xQ`,
                };
                const res = await lastValueFrom(this.http.post(url, apiPayload, { headers: headersRequest }));
                resolve(res)
            } catch (err) {
                console.log('Error in save survey =>', err)
                reject(err)
            }
        })
    }

    async payload(features, churchList: any = []) {
        const geoJson = await JSON.stringify(structuredClone(features));
        const strJson = jsonMinify(geoJson)

        const payload: any = {},
        
            admin0 = features?.properties?.admin0,
            admin1 = features?.properties?.admin1, 
            admin2 = features?.properties.admin2,
            admin3 = features?.properties.admin3,
            admin4 = features.properties.admin4;
            const changeAdmin4 = admin4.replace(/[^\u000A\u0020-\u007E]/g, ' ');
            const finalAdmin4 = changeAdmin4.replace(/[^\w\s]|[_-]/g, ' ').replace(/\s{2,}/g, ' ');
        payload.survey = {
            admin0: admin0,
            admin1: admin1,
            admin2: admin2,
            admin3: admin3,
            admin4: finalAdmin4,
            isMasterSurvey: true,
            isUserSurvey: false,
            noWork: Array.isArray(churchList) && churchList?.length ? false : true,
            approvedDate: new Date(),
            geojson: strJson,
            approverName: 'Admin',
            userId: '1',
            createdUserId: '1',
            churchCount: Array.isArray(churchList) && churchList?.length ? churchList.length : 0
        }
        payload.newChurches = structuredClone(churchList).map((cl) => {
            let res = {

                admin0: admin0,
                admin1: admin1,
                admin2: admin2,
                admin3: admin3,
                admin4: finalAdmin4,
                "name": cl?.properties?.name,
                "organization": cl?.organization?.organizationName,
                "memberCount": cl?.memberCount,
                "workerCount": 1,
                "phone_number": cl?.phone_number,
                "localLanguage": cl?.properties?.Church_Name_Marathi,
                "peopleGroups": cl?.people_group,
                "email": cl?.email,
                "location": {
                    "lat": cl?.geometry.coordinates[1],
                    "lng": cl?.geometry.coordinates[0],
                },
                "workerName": cl?.worker_name,
                "denomination":cl?.properties?.Church_Denomination,
                "address": cl?.properties?.Church_Address,
                "plusCode":cl?.properties?.Plus_Code,
                userId: '1',
                createdUserId: '1',
                "remarks": ""
            }
            return { ...cl, ...res }
        });
        return payload
    }




    async saveStatsWard(object_id, properties, churchList) {
        try {
            const payload = await this.statsPayload(properties, churchList);
            const url = `http://192.168.29.188/IIF_Local/iia-php-api/api/v1/adminStats/saveByName/${object_id}/1`;
            // const url = `https://api-iif.mhsglobal.org/api/v1/adminStats/saveByName/${object_id}/1`;

            axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });


            const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
            await delay(1000);

            const res = await axios.post(url, payload, { timeout: 18000000 });

            if (res && res.data) {
                console.log('Save Stats =>', res.data);
            }

            return res;
        } catch (error) {
            // console.log('Error in save stats =>', error.message || error);
            console.log('Error in save stats =>', error);
            throw error;
        }
    }


    // async saveStatsWard(object_id, feature, churchList) {
    //     try {
    //         const payload = await this.statsPayload(feature, churchList);
    //         const url = `https://api-iif.mhsglobal.org/api/v1/adminStats/saveByName/${object_id}/0`;

    //         // Retry logic (customizable)
    //         const maxRetries = 3;
    //         let attempt = 0;
    //         let res;

    //         do {
    //             try {
    //                 attempt++;
    //                 res = await this.http.post(url, payload, { timeout: 180000 }).toPromise();
    //                 console.log('Save Stats =>', res.data);
    //             } catch (error) {
    //                 console.log(`Error in save stats (attempt ${attempt} of ${maxRetries}):`, error.message || error);


    //                 if (attempt >= maxRetries) {
    //                     throw error;
    //                 }
    //             }
    //         } while (!res && attempt < maxRetries);

    //         return res;
    //     } catch (error) {
    //         console.log('Error in save stats =>', error.message || error);
    //         throw error;
    //     }
    // }

    statsPayload(properties, churchCount) {
        let payload: any = {};
        payload.no_member = 0
        payload.no_church = Array.isArray(churchCount) && churchCount?.length ? churchCount.length : 0
        // payload.no_church = churchCount
        payload.no_people = properties.tot_p_2011
        payload.no_house_hold = properties.no_hh_2011
        return payload
    }


    allChurchColletion: any[] = [];
    /* Survey Village and Ward Using MySQL */
    async surveyAdmin4(level: 'WARD' | 'VILLAGE', admin2Name: string) {
        let log = '', message = '';
        const row = 50;
        const admin4Query = this.admin4Repository.createQueryBuilder('admin4');
        const admin4count = await admin4Query
            .innerJoin('admin3', 'a3', 'a3.id=admin4.admin_3_fk_id')
            .innerJoin('admin2', 'a2', 'a2.id=a3.admin_2_fk_id')
            .where(`a2.admin_2_name = :value`, { value: admin2Name })
            .andWhere(`admin4.type = :type`, { type: level == 'WARD' ? 2 : 1 })
            .getCount();
        message = 'Ready to get Churches From Mongo \n';
        log += message
        console.log(message)
        await this.getAllChurchesUsingMongo();
        const totalChurches = this.allChurchColletion?.length || 0;
        message = `Churches Reads Successfully count => ${totalChurches} (without Duplicate) \n`;
        log += message;
        console.log(message)
        if (!+totalChurches) {
            message = `No Churches Data in Mongo \n`
            log += message;
            console.log(message)
            return 'No Churches Data in Mongo'
        }
        for (let i = 0; i <= admin4count / row; i++) {
            // await delay(1000)
            message = `Ready to get Admin4 data page => ${i}  \n`;
            log += message
            console.log(message)
            const admin4Data = await admin4Query
                .innerJoin('admin3', `ad3_${i}`, `ad3_${i}.id=admin4.admin_3_fk_id`)
                .innerJoin('admin2', `ad2_${i}`, `ad2_${i}.id=ad3_${i}.admin_2_fk_id`)
                .where(`ad2_${i}.admin_2_name = :value`, { value: admin2Name })
                .andWhere(`admin4.type = :type`, { type: level == 'WARD' ? 2 : 1 })
                .skip(i * row)
                .take(row)
                // .cache(false)
                .getMany();

            // for (const a4data of admin4Data) {
            await Promise.all(admin4Data.map(async (a4data) => {
                log += `Check Church for ${level} => ${a4data.admin_4_name} \n`;
                const churchList: any = [];
                const geometries = typeof a4data.geometries == 'string' ? JSON.parse(a4data.geometries) : a4data.geometries;
                const properties = typeof a4data.properties == 'string' ? JSON.parse(a4data.properties) : a4data.properties;
                console.log('a4data+++++', a4data);
                let index = 0
                for (const church of this.allChurchColletion) {
                    const latlng = { lat: church.geometry.coordinates[1], lng: church.geometry.coordinates[0] }
                    const isInside = await this.isMarkerInsidePolygon(latlng, geometries.coordinates);
                    if (isInside) {
                        churchList.push(church);
                        this.allChurchColletion.splice(index, 1)
                    }
                    index++
                }
                delete a4data.properties;
                delete a4data.geometries;
                a4data['properties'] = properties;
                a4data['geometries'] = geometries;
                message = `Available churches in ${a4data.admin_4_name} is => ${churchList.length} \n`;
                log += message
                console.log(message)
                message = `Ready to Save Survey for ${level} ${a4data.admin_4_name} \n`;
                log += message
                console.log(message)
                await this.saveSurvey(a4data, churchList).then(async (res) => {
                    log += `Save Survey Successfull for ${level} ${a4data.admin_4_name} \n`;
                    // if (res) {
                    //     log += `Ready to Save  Stats for ${level} ${a4data.admin_4_name} \n`;
                    //     //save stats
                    //     await this.saveStatsWard(a4data.object_id, properties, churchList)
                    // }
                })
            }))
            // }
        }
        message = `==============No of churches present in the ${level}S: ${totalChurches - this.allChurchColletion.length}============== \n`;
        message = `==============No of churches not present in the ${level}S: ${this.allChurchColletion.length}============== \n`;
        log += message
        console.log(message)
        const path = 'src/assets/survey'
        if (this.allChurchColletion.length) {
            this.allChurchColletion = structuredClone(this.allChurchColletion).map((a) => {
                a.name = a?.properties?.name
                a.admin1 = a?.properties?.admin1
                a.admin2 = a?.properties?.admin2
                a.admin3 = a?.properties?.admin3
                a.admin4 = a?.properties?.admin4
                a.properties = JSON.stringify(a.properties)
                a.geometry = JSON.stringify(a.geometry)
                return a
            })
            await writeCSV(this.allChurchColletion, `${path}/failed-churches.csv`);
        }
        message = `================================= Completed =================================`;
        log += message
        console.log(message)
        await writeFileSync(`${path}/log_${Date.now()}.log`, log);
        return log;
    }

    async getAllChurchesUsingMongo() {
        if (Array.isArray(this.allChurchColletion) && this.allChurchColletion.length) {
            return this.allChurchColletion;
        }
        console.log('Ready to Connect Mongo');
        const client = await MongoClient.connect('mongodb+srv://itoi:Yu7blcAMUUC8jAFU@cluster0-oi4s9.mongodb.net/iif-dev-db?retryWrites=true&w=majority'); //from dev ;
        const db = client.db('iif-dev-db');
        const churchCollection = await db.collection('geocode_responses').find({}).toArray() || [];
        client.close();
        this.allChurchColletion = this.removeDuplicate(churchCollection || []) || [];
        return this.allChurchColletion;
    }

    removeDuplicate(arr: Array<any>) {
        if (!arr.length) {
            return []
        }
        // console.log('array => ', arr?.length, arr)
        const uniqueArray = arr?.filter((item, index, self) => {
            const firstIndex = self.findIndex((el) => el.geometry.coordinates[1] === item.geometry.coordinates[1] && el.geometry.coordinates[0] === item.geometry.coordinates[0]);
            return index === firstIndex;
        }) || [];
        return uniqueArray
    }

    isMarkerInsidePolygon(marker, polygon): Promise<any> {
        const point = marker;
        polygon = polygon[0];
        let x = point.lng,
            // let x = point.lon,
            y = point.lat;

        let inside: any = false;
        for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
            let xi = polygon[i][0],
                yi = polygon[i][1];
            let xj = polygon[j][0],
                yj = polygon[j][1];

            let intersect =
                yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
            if (intersect) inside = !inside;
        }
        return inside;
    }
}