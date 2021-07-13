using Settlement.Core.Constants;
using Settlement.Sportsbook.Aio.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.Aio.Services.Badminton
{
    public interface IBadmintonBetTypeService
    {
        MatchResultDetail GetBetTypeName(MatchResultDetail item);
    }

    public class BadmintonBetTypeServiceImp : IBadmintonBetTypeService
    {
        private const int BetTypeCharacter = 3;
        private const int ThreePosition = 3;
        private const int MapCharacter = 2;

        public MatchResultDetail GetBetTypeName(MatchResultDetail item)
        {
            var resourceId = item.ResourceId;
            item.Map = Convert.ToInt32(resourceId.Substring(ThreePosition, MapCharacter));
            item.BetType = resourceId.Substring(0, BetTypeCharacter);
            item.BetTypeName = BetTypeNameGroupOne(item.BetType, resourceId);

            return item;
        }

        private static string BetTypeNameGroupOne(string betType, string resourceId)
        {
            var gameX = resourceId.Substring(4, 1);
            var pointChar = resourceId.Substring(5, 2);
            var point = Convert.ToInt32(pointChar);
            var betTypeConvert = Convert.ToInt32(betType);

            return betTypeConvert == BetType.BadmintonBetType.MapGameRacePoint ? $"Game {gameX} Race to {point} Points" : $"Game {gameX} Point {point} Winner";
        }
    }
}
