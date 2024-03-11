import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Admin0, Admin1, Admin2, Admin3, Admin4, City, Country, District, State, SubDistrict, Village, Ward } from './map/entity/map.entity';
import { KmlService } from './map/kml.service';
import { MapService } from './map/map.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { HeuristicSurveyController } from '../heuristic_survey/heuristic_survey.controller';
import { HeuristicSurveyService } from '../heuristic_survey/heuristic_survey.service';

const http = require('http'),
  https = require('https'),
  httpAgent = new http.Agent({ keepAlive: true,keepAliveMsecs :90000000}),
  httpsAgent = new https.Agent({ keepAlive: true,keepAliveMsecs:90000000 });
@Module({
  imports: [
    HttpModule.register({
      timeout: 90000000,
      httpAgent: httpAgent,
      httpsAgent:httpsAgent
    }),
     TypeOrmModule.forFeature([Country, State, District, SubDistrict, Village, City, Ward,Admin0,Admin1,Admin2,Admin3,Admin4])
  ], //User
  controllers: [UserController,HeuristicSurveyController],
  providers: [UserService, KmlService, MapService,HeuristicSurveyService],
  exports: [UserService,HeuristicSurveyService]
})
export class UserModule { }
