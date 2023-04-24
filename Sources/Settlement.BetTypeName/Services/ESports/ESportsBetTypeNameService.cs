using Fanex.RemotingRef;
using Settlement.BetTypeName.MapperFactory;
using Settlement.Core.Constants;
using Settlement.Core.Services;

namespace Settlement.BetTypeName.Services.ESports;

public class ESportsBetTypeNameService : IMapperService
{
    private readonly IRefDataService refDataService;
    private const int FourPosition = 4;

    public ESportsBetTypeNameService()
    {
        var remotingRefService = new RemotingRefService();
        refDataService = new RefDataService(remotingRefService);
    }

    public string GetResourceName(string resourceId)
    {
        var betType = resourceId[..FourPosition];
        return BetTypeNameGroupOne(betType, resourceId);
    }

    private string BetTypeNameGroupOne(string betType, string resourceId)
    {
        var mapX = resourceId.Substring(5, 1);
        var betTypeId = Convert.ToInt32(betType);
        return betTypeId switch
        {
            BetType.ESportBetType.MapDragonsScore => $"Map {mapX} Dragons Score",
            BetType.ESportBetType.MapBaronsScore => $"Map {mapX} Barons Score",
            BetType.ESportBetType.MapInhibitorsScore => $"Map {mapX} Inhibitors Score",
            BetType.ESportBetType.MapTyrantsScore => $"Map {mapX} Tyrants Score",
            BetType.ESportBetType.MapLordsScore => $"Map {mapX} Overlords Score",
            BetType.ESportBetType.MapDuration => $"Map {mapX} Duration",
            BetType.ESportBetType.MapRoundsScore => $"Map {mapX} Rounds Score",
            BetType.ESportBetType.MapRoundsScoreOvertime => $"Map {mapX} Rounds Score (including Overtime)",
            BetType.ESportBetType.MapTotalFirstKills => $"Map {mapX} Total First Kills",
            _ => BetTypeNameGroupTwo(betTypeId, resourceId)
        };
    }

    private string BetTypeNameGroupTwo(int betTypeId, string resourceId)
    {
        var mapX = resourceId.Substring(5, 1);

        return betTypeId switch
        {
            BetType.ESportBetType.MapKillsScore => $"Map {mapX} Total Kills Score",
            BetType.ESportBetType.MapTowersScore => $"Map {mapX} Towers Score",
            BetType.ESportBetType.MapRoshansScore => $"Map {mapX} Roshans Score",
            BetType.ESportBetType.MapBarracksScore => $"Map {mapX} Barracks Score",
            BetType.ESportBetType.MapTurretsScore => $"Map {mapX} Turrets Score",
            BetType.ESportBetType.MapClutchesScore => $"Map {mapX} Clutches Score",
            BetType.ESportBetType.MapFirstBloodTime => $"Map {mapX} First Blood Time",
            BetType.ESportBetType.MapTotalKillTenMin => $"Map {mapX} Total Kills at 10 Mins",
            BetType.ESportBetType.MapTotalKillTwentyMin => $"Map {mapX} Total Kills at 20 Mins",
            _ => BetTypeNameGroupThree(betTypeId, resourceId)
        };
    }

    private string BetTypeNameGroupThree(int betTypeId, string resourceId)
    {
        var mapX = resourceId.Substring(5, 1);

        return betTypeId switch
        {
            BetType.ESportBetType.MapMostTurretsDestroyedLane => $"Map {mapX} Lane With Most Turrets Destroyed",
            BetType.ESportBetType.MapFirstTurretLocation => $"Map {mapX} First Turret Location",
            BetType.ESportBetType.MapTotalGold => $"Map {mapX} Total Gold",
            BetType.ESportBetType.MapFirstTyrantTime => $"Map {mapX} First Tyrant Time",
            BetType.ESportBetType.MapFirstDarkTyrant => $"Map {mapX} First Dark Tyrant",
            BetType.ESportBetType.MapFirstOverlordTime => $"Map {mapX} First Overlord Time",
            BetType.ESportBetType.MapStormDragonKilled => $"Map {mapX} Will Storm Dragon Be Killed",
            BetType.ESportBetType.MapFirstHerald => $"Map {mapX} First Herald",
            BetType.ESportBetType.MapFirstHeraldTime => $"Map {mapX} First Herald Time",
            _ => BetTypeNameGroupFour(betTypeId, resourceId)
        };
    }

    private string BetTypeNameGroupFour(int betTypeId, string resourceId)
    {
        var mapX = resourceId.Substring(5, 1);

        return betTypeId switch
        {
            BetType.ESportBetType.MapFirstBaronTime => $"Map {mapX} First Baron Time",
            BetType.ESportBetType.MapNumberOfPlayersFirstBaronBuffed => $"Map {mapX} First Baron No. Players Buff",
            BetType.ESportBetType.MapFirstInhibitorTime => $"Map {mapX} First Inhibitor Time",
            BetType.ESportBetType.MapFirstInhibitorLocation => $"Map {mapX} First Inhibitor Location",
            BetType.ESportBetType.MapFirstDragonTime => $"Map {mapX} First Dragon Time",
            BetType.ESportBetType.MapElderDragonKilled => $"Map {mapX} Will Elder Dragon Be Killed",
            BetType.ESportBetType.MapFirstAegisSnatched => $"Map {mapX} Will Any Aegis Be Snatched Yes/No",
            BetType.ESportBetType.MapFirstTowerTime => $"Map {mapX} First Tower Time",
            BetType.ESportBetType.MapFirstTowerLocation => $"Map {mapX} First Tower Location",
            _ => BetTypeNameGroupFive(betTypeId, resourceId)
        };
    }

    private string BetTypeNameGroupFive(int betTypeId, string resourceId)
    {
        var mapX = resourceId.Substring(5, 1);

        return betTypeId switch
        {
            BetType.ESportBetType.MapFirstRoshanTime => $"Map {mapX} First Roshan Time",
            BetType.ESportBetType.MapFirstBarrackTime => $"Map {mapX} First Barrack Time",
            BetType.ESportBetType.MapFirstBarrackLocation => $"Map {mapX} First Barrack Location",
            BetType.ESportBetType.MapTotalBombDetonation => $"Map {mapX} Total Bomb Detonations (excl. OT)",
            BetType.ESportBetType.MapTotalBombDefuses => $"Map {mapX} Total Bomb Defuses (excl. OT)",
            BetType.ESportBetType.MapLaneWithMostTurretsDestroyed =>
                $"Map {mapX} Lane With Most Turrets Destroyed (KOG)",
            BetType.ESportBetType.MapFirstTurretLocationKog => $"Map {mapX} First Turret Location (KOG)",
            _ => BetTypeNameGroupSix(betTypeId, resourceId)
        };
    }

    private string BetTypeNameGroupSix(int betTypeId, string resourceId)
    {
        const int twoPosition = 2;
        const int fourPosition = 4;
        const int sixPosition = 6;
        var mapX = resourceId.Substring(5, 1);
        int mapY;

        switch (betTypeId)
        {
            case BetType.ESportBetType.MapRoundWinner:
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} Round {mapY} Winner";

            case BetType.ESportBetType.MapRoundTotalKills:
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} Round {mapY} Total Kills";

            case BetType.ESportBetType.MapFirstToKillTime:
                mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                return $"Map {mapX} First to {mapY} Kills Time";

            case BetType.ESportBetType.MapSpecificKill:
                {
                    mapY = Convert.ToInt32(resourceId.Substring(sixPosition, twoPosition));
                    var ordinal = GenerateOrdinals(mapY);
                    return $"Map {mapX} {mapY}{ordinal} Kill";
                }
            default:
                return refDataService.GetBetTypeName(betTypeId, resourceId[fourPosition..]);
        }
    }

    private static string GenerateOrdinals(int number)
    {
        var ordinal = number.ToString();
        var lastCharacter = ordinal[^1..];
        return lastCharacter switch
        {
            "1" => "st",
            "2" => "nd",
            "3" => "rd",
            _ => "th"
        };
    }
}