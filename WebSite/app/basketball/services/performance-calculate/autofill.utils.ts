import { OddFlexModel, ResultDetail } from "../../../shared/models/sportsbook-sop";

export const statisticToResourceId: Record<string, string> = {
  points: "653",
  rebounds: "659",
  assists: "656",
  steals: "667",
  blocks: "665",
  three_points: "662"
};


export function compareWithCondition(value: number, condition: string): boolean {
  const matched = condition.match(/^(\d+)([+-]?)$/);
  if (!matched) {
    return false;
  }

  const threshold = parseInt(matched[1], 10);
  const operator = matched[2];

  switch (operator) {
    case '+': return value >= threshold;
    case '-': return value < threshold;
    default: return value === threshold;
  }
}


export function validateCalcFinalResult(oddFlex: OddFlexModel, finalResult: ResultDetail): boolean {
  const { isHome, teamId } = oddFlex.info;
  const homeValue = Number(finalResult.homeValue) || 0;
  const awayValue = Number(finalResult.awayValue) || 0;
  const totalScore = homeValue + awayValue;

  const validators: Record<string, (value: number) => boolean> = {
    winner: (teamIdValue) => {
      const isHomeTeam = teamIdValue === teamId && isHome;
      return isHomeTeam ? homeValue > awayValue : awayValue > homeValue;
    },
    over: (score) => totalScore > score,
    handicap: (handicap) =>
      isHome ? homeValue - handicap >= awayValue : awayValue - handicap >= homeValue
  };

  return oddFlex.info.results.every(result => {
    const validator = validators[result.type];
    return validator ? validator(parseInt(result.value, 10)) : false;
  });
}