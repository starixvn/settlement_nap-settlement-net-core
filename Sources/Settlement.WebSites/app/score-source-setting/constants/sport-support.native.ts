import { SportType } from "../../shared/constants";

export class Sport {
    sportType: number;
    sportName: string;

    constructor(sportType: number, sportName: string) {
        this.sportName = sportName;
        this.sportType = sportType;
    }
}

export const sportSupport = {
    outsideSource: [new Sport(SportType.badminton, 'Badminton'), new Sport(SportType.basketBall, 'Basketball'),
                    new Sport(SportType.cricket, 'Cricket'), new Sport(SportType.eSports, 'E-sports'),
                    new Sport(SportType.tennis, 'Tennis')],
    gameTypes: [SportType.eSports]
};
