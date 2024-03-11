import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HeuristicSurveyService } from "./heuristic_survey.service";
import { HeuristicSurveyController } from "./heuristic_survey.controller";
import { Admin0, Admin1, Admin2, Admin3, Admin4 } from "./entity/map-data.entity";
import { HttpModule } from "@nestjs/axios";

@Module({
    imports: [
        HttpModule,
        TypeOrmModule.forFeature([Admin0, Admin1, Admin2, Admin3, Admin4])
    ],
    providers: [HeuristicSurveyService],
    controllers: [HeuristicSurveyController],
})
export class HeuristicSurveyModule { }