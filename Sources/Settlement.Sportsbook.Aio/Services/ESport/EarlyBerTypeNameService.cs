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

        private readonly IRefDataService refDataService;

        public EarlyBetTypeNameServiceImp(IRefDataService refDataService)
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

                case BetType.ESportBetType.MapFirstBloodTime:
                    return $"Map {mapX} First Blood Time";

                case BetType.ESportBetType.MapTotalKillTenMin:
                    return $"Map {mapX} Total Kills at 10 Mins";

                case BetType.ESportBetType.MapTotalKillTwentyMin:
                    return $"Map {mapX} Total Kills at 20 Mins";

                default:
                    return BetTypeNameGroupThree(betTypeId, resourceId);
            }
        }

        private string BetTypeNameGroupThree(int betTypeId, string resourceId)
        {
            var mapX = resourceId.Substring(5, 1);

            switch (betTypeId)
            {
                case BetType.ESportBetType.MapMostTurretsDestroyedLane:
                    return $"Map {mapX} Lane With Most Turrets Destroyed";

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

                default:
                    return BetTypeNameGroupFour(betTypeId, resourceId);
            }
        }

        private string BetTypeNameGroupFour(int betTypeId, string resourceId)
        {
            var mapX = resourceId.Substring(5, 1);

            switch (betTypeId)
            {
                case BetType.ESportBetType.MapFirstBaronTime:
                    return $"Map {mapX} First Baron Time";

                case BetType.ESportBetType.MapNumberOfPlayersFirstBaronBuffed:
                    return $"Map {mapX} First Baron No. Players Buff";

                case BetType.ESportBetType.MapFirstInhibitorTime:
                    return $"Map {mapX} First Inhibitor Time";

                case BetType.ESportBetType.MapFirstInhibitorLocation:
                    return $"Map {mapX} First Inhibitor Location";

                case BetType.ESportBetType.MapFirstDragonTime:
                    return $"Map {mapX} First Dragon Time";

                case BetType.ESportBetType.MapElderDragonKilled:
                    return $"Map {mapX} Will Elder Dragon Be Killed";

                case BetType.ESportBetType.MapFirstAegisSnatched:
                    return $"Map {mapX} Will Any Aegis Be Snatched Yes/No";

                case BetType.ESportBetType.MapFirstTowerTime:
                    return $"Map {mapX} First Tower Time";

                case BetType.ESportBetType.MapFirstTowerLocation:
                    return $"Map {mapX} First Tower Location";

                default:
                    return BetTypeNameGroupFive(betTypeId, resourceId);
            }
        }

        private string BetTypeNameGroupFive(int betTypeId, string resourceId)
        {
            var mapX = resourceId.Substring(5, 1);

            switch (betTypeId)
            {
                case BetType.ESportBetType.MapFirstRoshanTime:
                    return $"Map {mapX} First Roshan Time";

                case BetType.ESportBetType.MapFirstBarrackTime:
                    return $"Map {mapX} First Barrack Time";

                case BetType.ESportBetType.MapFirstBarrackLocation:
                    return $"Map {mapX} First Barrack Location";

                case BetType.ESportBetType.MapTotalBombDetonation:
                    return $"Map {mapX} Total Bomb Detonations (excl. OT)";

                case BetType.ESportBetType.MapTotalBombDefuses:
                    return $"Map {mapX} Total Bomb Defuses (excl. OT)";

                case BetType.ESportBetType.MapLaneWithMostTurretsDestroyed:
                    return $"Map {mapX} Lane With Most Turrets Destroyed (KOG)";

                case BetType.ESportBetType.MapFirstTurretLocationKOG:
                    return $"Map {mapX} First Turret Location (KOG)";

                default:
                    return BetTypeNameGroupSix(betTypeId, resourceId);
            }
        }

        private string BetTypeNameGroupSix(int betTypeId, string resourceId)
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

        private static string GenerateOrdinals(int number)
        {
            var ordinal = number.ToString();
            var lastCharater = ordinal.Substring(ordinal.Length - 1);
            if (lastCharater == "1")
            {
                return "st";
            }

            if (lastCharater == "2")
            {
                return "nd";
            }

            if (lastCharater == "3")
            {
                return "rd";
            }

            return "th";
        }
    }
}