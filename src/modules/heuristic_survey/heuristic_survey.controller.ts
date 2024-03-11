import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { HeuristicSurveyService } from "./heuristic_survey.service";

@Controller('heuristic')
export class HeuristicSurveyController {
    constructor(
        private heuristicServ: HeuristicSurveyService
    ) { }


    @Get('surveyAdmin4/:admin2')
    async surveyAdmin4(@Param('admin2') admin2) {
        return await this.heuristicServ.surveyAdmin4('VILLAGE', admin2)
    }

}