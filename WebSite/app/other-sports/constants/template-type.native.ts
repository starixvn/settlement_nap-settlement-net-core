import { SportType } from "../../shared/constants";

export const TemplateType = {
    halfTimeFullTimeTemplate: [SportType.football, SportType.rugby, SportType.netBall, SportType.iceHockey, SportType.fieldHockey],
    gameTotalMatchTemplate: [SportType.squash, SportType.sepakTakraw],
    onlyFullTimeTemplate: [SportType.snookerPool, SportType.golf, SportType.motorsports,
        SportType.darts, SportType.winterSports,
        SportType.cycling, SportType.fencing, SportType.judo, SportType.mPentathlon, SportType.rowing, SportType.sailing,
        SportType.shooting, SportType.taekwondo, SportType.triathlon, SportType.wrestling, SportType.muayThai, SportType.beachSoccer,
        SportType.poker, SportType.chess, SportType.olympics, SportType.finance, SportType.alpineSkiing,
        SportType.biathlon, SportType.curling, SportType.figureSkating, SportType.freestyleSkiing,
        SportType.luge, SportType.skeleton, SportType.skiJumping, SportType.speedSkating,
        SportType.archery, SportType.athletics, SportType.boxingMMA,
        SportType.canoeing, SportType.diving, SportType.entertainment, SportType.equestrian, SportType.gymnastics,
        SportType.politics, SportType.swimming, SportType.weightLifting],
    hasOT: [SportType.bandy]

};