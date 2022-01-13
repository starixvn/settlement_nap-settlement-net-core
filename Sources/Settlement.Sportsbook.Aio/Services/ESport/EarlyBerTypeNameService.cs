using Settlement.Core.Constants;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Models;
using System;

namespace Settlement.Sportsbook.Aio.Services.ESport
{
    public interface IEarlyBetTypeNameService
    {
        ResultDetail GetBetTypeName(ResultDetail item);
    }

    public class EarlyBetTypeNameServiceImp : IEarlyBetTypeNameService
    {
        private const int TwoPosition = 2;
        private const int FourPosition = 4;

        private readonly RefDataService refDataService;

        public EarlyBetTypeNameServiceImp(RefDataService refDataService)
        {
            this.refDataService = refDataService;
        }

        public ResultDetail GetBetTypeName(ResultDetail item)
        {
            var resourceId = item.ResourceId;
            item.Map = Convert.ToInt32(resourceId.Substring(FourPosition, TwoPosition));
            item.BetType = resourceId.Substring(0, FourPosition);
            item.BetTypeName = BetTypeNameGroupOne(item.BetType, resourceId);

            return item;
        }

        private string BetTypeNameGroupOne(string betType, string resourceId)
        {
            var mapX = resourceId.Substring(5, 1);
            var betTypeId = Convert.ToInt32(betType);
            switch (betTypeId)
            {
                case BetType.ESportBetType.MapDragonsScore:
                    return $"Map {mapX} Dragons Score";

                case BetType.ESportBetType.MapBaronsScore:
                    return $"Map {mapX} Barons Score";

                case BetType.ESportBetType.MapInhibitorsScore:
                    return $"Map {mapX} Inhibitors Score";

                case BetType.ESportBetType.MapTyrantsScore:
                    return $"Map {mapX} Tyrants Score";

                case BetType.ESportBetType.MapLordsScore:
                    return $"Map {mapX} Overlords Score";

                case BetType.ESportBetType.MapDuration:
                    return $"Map {mapX} Duration";

                case BetType.ESportBetType.MapRoundsScore:
                    return $"Map {mapX} Rounds Score";

                case BetType.ESportBetType.MapRoundsScoreOvertime:
                    return $"Map {mapX} Rounds Score (including Overtime)";

                case BetType.ESportBetType.MapTotalFirstKills:
                    return $"Map {mapX} Total First Kills";

                case BetType.ESportBetType.MapFirstBloodTimeOU:
                    return $"Map {mapX} First Blood Time Over/Under";

                case BetType.ESportBetType.MapTotalKillTenMinHDP:
                    return $"Map {mapX} Total Kills at 10 Mins Handicap";

                case BetType.ESportBetType.MapTotalKillTenMinOU:
                    return $"Map {mapX} Total Kills at 10 Mins Over/Under";
                case BetType.ESportBetType.MapTotalKillTwentyMinHDP:
                    return $"Map {mapX} Total Kills at 20 Mins Handicap";
                case BetType.ESportBetType.MapTotalKillTwentyMinOU:
                    return $"Map {mapX} Total Kills at 20 Mins Over/Under";
                case BetType.ESportBetType.MapHomeTotalKillTenMinOU:
                    return $"Map {mapX} Home Team Total Kills at 10 Mins Over/Under";
                case BetType.ESportBetType.MapAwayTotalKillTenMinOU:
                    return $"Map {mapX} Away Team Total Kills at 10 Mins Over/Under";
                case BetType.ESportBetType.MapHomeTotalKillTwentyMinOU:
                    return $"Map {mapX} Home Team Total Kills at 20 Mins Over/Under";
                case BetType.ESportBetType.MapAwayTotalKillTwentyMinOU:
                    return $"Map {mapX} Away Team Total Kills at 20 Mins Over/Under";
                case BetType.ESportBetType.MapHomeTotalKillOU:
                    return $"Map {mapX} Home Team Total Kills Over/Under";
                case BetType.ESportBetType.MapAwayTotalKillOU:
                    return $"Map {mapX} Away Team Total Kills Over/Under";
                case BetType.ESportBetType.MapFirstTurretTimeOU:
                    return $"Map {mapX} First Turret Time Over/Under";
                case BetType.ESportBetType.MapFirstTurretLocation:
                    return $"Map {mapX} First Turret Location";
                case BetType.ESportBetType.MapTotalGoldMoneyline:
                    return $"Map {mapX} Total Gold Moneyline";
                case BetType.ESportBetType.MapTotalGoldHDP:
                    return $"Map {mapX} Total Gold Handicap";
                case BetType.ESportBetType.MapTotalGoldOU:
                    return $"Map {mapX} Total Gold Over/Under";
                case BetType.ESportBetType.MapHomeTotalGoldOU:
                    return $"Map {mapX} Home Team Total Gold Over/Under";
                case BetType.ESportBetType.MapAwayTotalGoldOU:
                    return $"Map {mapX} Away Team Total Gold Over/Under";
                case BetType.ESportBetType.MapTotalGoldOE:
                    return $"Map {mapX} Total Gold Odd/Even";
                case BetType.ESportBetType.MapFirstTyrantTimeOU:
                    return $"Map {mapX} First Tyrant Time Over/Under";
                case BetType.ESportBetType.MapFirstDarkTyrant:
                    return $"Map {mapX} First Dark Tyrant";
                case BetType.ESportBetType.MapFirstOverlordTimeOU:
                    return $"Map {mapX} First Overlord Time Over/Under";
                case BetType.ESportBetType.MapStormDragonKilled:
                    return $"Map {mapX} Will Storm Dragon Be Killed Yes/No";
                case BetType.ESportBetType.MapFirstHerald:
                    return $"Map {mapX} First Herald";
                case BetType.ESportBetType.MapFirstHeraldTimeOU:
                    return $"Map {mapX} First Herald Time Over/Under";
                case BetType.ESportBetType.MapFirstBaronTimeOU:
                    return $"Map {mapX} First Baron Time Over/Under";
                case BetType.ESportBetType.MapNumberOfPlayersFirstBaronBuffedOU:
                    return $"Map {mapX} First Barron No. Players Buff Over/Under";
                case BetType.ESportBetType.MapFirstInhibitorTimeOU:
                    return $"Map {mapX} First Inhibitor Time Over/Under";
                case BetType.ESportBetType.MapFirstInhibitorLocation:
                    return $"Map {mapX} First Inhibitor Location";
                case BetType.ESportBetType.MapFirstDragonTimeOU:
                    return $"Map {mapX} First Dragon Time Over/Under";
                case BetType.ESportBetType.MapFirstElderDragon:
                    return $"Map {mapX} First Elder Dragon";
                case BetType.ESportBetType.MapFirstAegisSnatched:
                    return $"Map {mapX} Will First Aegis Be Snatched Yes/No";
                case BetType.ESportBetType.MapFirstTowerTimeOU:
                    return $"Map {mapX} First Tower Time Over/Under";
                case BetType.ESportBetType.MapFirstTowerLocation:
                    return $"Map {mapX} First Tower Location";
                case BetType.ESportBetType.MapFirstRoshanTimeOU:
                    return $"Map {mapX} First Roshan Time Over/Under";
                case BetType.ESportBetType.MapFirstBarrackTimeOU:
                    return $"Map {mapX} First Barrack Time Over/Under";
                case BetType.ESportBetType.MapFirstBarrackLocation:
                    return $"Map {mapX} First Barrack Location";

                default:
                    return BetTypeNameGroupTwo(betTypeId, resourceId);
            }
        }

        private string BetTypeNameGroupTwo(int betTypeId, string resourceId)
        {
            var mapX = resourceId.Substring(5, 1);

            switch (betTypeId)
            {
                case BetType.ESportBetType.MapKillsScore:
                    return $"Map {mapX} Total Kills Score";

                case BetType.ESportBetType.MapTowersScore:
                    return $"Map {mapX} Towers Score";

                case BetType.ESportBetType.MapRoshansScore:
                    return $"Map {mapX} Roshans Score";

                case BetType.ESportBetType.MapBarracksScore:
                    return $"Map {mapX} Barracks Score";

                case BetType.ESportBetType.MapTurretsScore:
                    return $"Map {mapX} Turrets Score";

                case BetType.ESportBetType.MapClutchesScore:
                    return $"Map {mapX} Clutches Score";

                default:
                    return BetTypeNameGroupThree(betTypeId, resourceId);
            }
        }

        private string BetTypeNameGroupThree(int betTypeId, string resourceId)
        {
            const int twoPosition = 2;
            const int fourPosition = 4;
            const int sixPosition = 6;
            var mapX = resourceId.Substring(5, 1);
            int mapY;

            if (betTypeId == BetType.ESportBetType.MapRoundWinner)
            {
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} Round {mapY} Winner";
            }
            else if (betTypeId == BetType.ESportBetType.MapRoundTotalKills)
            {
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} Round {mapY} Total Kills";
            }
            else if (betTypeId == BetType.ESportBetType.MapFirstToKillTimeOU)
            {
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} First to {mapY} Kills Time Over/Under";
            }
            else if (betTypeId == BetType.ESportBetType.MapSpecificKill)
            {
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                var ordinal = GenerateOrdinals(mapY);
                return $"Map {mapX} {mapY}{ordinal} Kill";
            }
            else
            {
                return refDataService.GetBetTypeName(betTypeId, resourceId.Substring(fourPosition));
            }
        }

        private string GenerateOrdinals(int number)
        {
            if (number.ToString()[0] == '1')
            {
                return "st";
            }

            if (number.ToString()[0] == '2')
            {
                return "nd";
            }

            if (number.ToString()[0] == '3')
            {
                return "rd";
            }

            return "th";
        }
    }
}