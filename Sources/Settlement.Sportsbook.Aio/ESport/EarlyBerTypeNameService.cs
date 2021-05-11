using Settlement.Core.Constants;
using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Models;
using System;

namespace Settlement.Sportsbook.Aio.ESport
{
    public interface IEarlyBetTypeNameService
    {
        MatchResultDetail GetBetTypeName(MatchResultDetail item);
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

        public MatchResultDetail GetBetTypeName(MatchResultDetail item)
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
            else
            {
                return refDataService.GetBetTypeName(betTypeId, resourceId.Substring(fourPosition));
            }
        }
    }
}