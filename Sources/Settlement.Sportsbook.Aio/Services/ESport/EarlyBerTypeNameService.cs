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

                case BetType.ESportBetType.MapFirstBloodTime:
                    return $"Map {mapX} First Blood Time";

                case BetType.ESportBetType.MapTotalKillTenMin:
                    return $"Map {mapX} Total Kills at 10 Mins";

                case BetType.ESportBetType.MapTotalKillTwentyMin:
                    return $"Map {mapX} Total Kills at 20 Mins";

                case BetType.ESportBetType.MapFirstTurretTime:
                    return $"Map {mapX} First Turret Time";

                case BetType.ESportBetType.MapFirstTurretLocation:
                    return $"Map {mapX} First Turret Location";

                case BetType.ESportBetType.MapTotalGold:
                    return $"Map {mapX} Total Gold";

                case BetType.ESportBetType.MapFirstTyrantTime:
                    return $"Map {mapX} First Tyrant Time";

                case BetType.ESportBetType.MapFirstDarkTyrant:
                    return $"Map {mapX} First Dark Tyrant";

                case BetType.ESportBetType.MapFirstOverlordTime:
                    return $"Map {mapX} First Overlord Time";

                case BetType.ESportBetType.MapStormDragonKilled:
                    return $"Map {mapX} Will Storm Dragon Be Killed";

                case BetType.ESportBetType.MapFirstHerald:
                    return $"Map {mapX} First Herald";

                case BetType.ESportBetType.MapFirstHeraldTime:
                    return $"Map {mapX} First Herald Time";

                case BetType.ESportBetType.MapFirstBaronTime:
                    return $"Map {mapX} First Baron Time";
                case BetType.ESportBetType.MapNumberOfPlayersFirstBaronBuffed:
                    return $"Map {mapX} First Barron No. Players Buff";
                case BetType.ESportBetType.MapFirstInhibitorTime:
                    return $"Map {mapX} First Inhibitor Time";
                case BetType.ESportBetType.MapFirstInhibitorLocation:
                    return $"Map {mapX} First Inhibitor Location";
                case BetType.ESportBetType.MapFirstDragonTime:
                    return $"Map {mapX} First Dragon Time";
                case BetType.ESportBetType.MapFirstElderDragon:
                    return $"Map {mapX} First Elder Dragon";
                case BetType.ESportBetType.MapFirstAegisSnatched:
                    return $"Map {mapX} Will First Aegis Be Snatched";
                case BetType.ESportBetType.MapFirstTowerTime:
                    return $"Map {mapX} First Tower Time";
                case BetType.ESportBetType.MapFirstTowerLocation:
                    return $"Map {mapX} First Tower Location";
                case BetType.ESportBetType.MapFirstRoshanTime:
                    return $"Map {mapX} First Roshan Time";
                case BetType.ESportBetType.MapFirstBarrackTime:
                    return $"Map {mapX} First Barrack Time";
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
            else if (betTypeId == BetType.ESportBetType.MapFirstToKillTime)
            {
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} First to {mapY} Kills Time";
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