using static Settlement.Core.Constants.BetType;

namespace Settlement.Sportsbook.Soccer.Services.GetMatch;

using Settlement.Core.Services;

public interface EarlyBetTypeNameService
{
    int GetGroupMap(int betTypeId, string resourceId);

    string GetBetTypeName(int betTypeId, string resourceId);
}

public class EarlyBetTypeNameServiceImp(IRefDataService refDataService) : EarlyBetTypeNameService
{
    private const int PenaltyShootoutRound1Group = 1;
    private const int PenaltyShootoutRound2Group = 2;
    private const int PenaltyShootoutRound3Group = 3;
    private const int PenaltyShootoutRound4Group = 4;
    private const int PenaltyShootoutRound5Group = 5;

    private const int PenaltyShootoutSuddenDeadGroup = 8;

    private static Dictionary<int, List<string>> PenaltyShootoutRound => new()
    {
        { PenaltyShootoutRound1Group, ["38201", "38101", "38301", "38401", "38501"] },
        { PenaltyShootoutRound2Group, ["38202", "38102", "38302", "38402", "38502"] },
        { PenaltyShootoutRound3Group, ["38203", "38103", "38303", "38403", "38503"] },
        { PenaltyShootoutRound4Group, ["38204", "38104", "38304", "38404", "38504"] },
        { PenaltyShootoutRound5Group, ["38205", "38105", "38305", "38405", "38505"] }
    };

    public int GetGroupMap(int betTypeId, string resourceId)
    {
        var isCorner = betTypeId is SoccerBetType.TimeOfFirstCorner or SoccerBetType.TimeOfSecondCorner;
        var isGoal = betTypeId is SoccerBetType.ExtraTimeNextGoal or SoccerBetType.FirstGoalMethod or SoccerBetType.TimeOfFirstGoal;
        return isGoal || isCorner ? OtherGroup(betTypeId) : PenaltyShootoutGroup(betTypeId, resourceId);
    }

    private static int GetPenaltyShootoutRound(string resourceId)
    {
        return Convert.ToInt32(Round(resourceId)) > PenaltyShootoutRound5Group ?
            PenaltyShootoutSuddenDeadGroup :
            (from item in PenaltyShootoutRound
             where item.Value.Contains(resourceId)
             select item.Key).FirstOrDefault();
    }

    private static int PenaltyShootoutGroup(int betTypeId, string resourceId)
    {
        const int penaltyShootoutFirstTen = 6;

        return betTypeId switch
        {
            SoccerBetType.PenaltyShootoutOddEven => penaltyShootoutFirstTen,
            SoccerBetType.PenaltyShootoutExactTotalGoals => penaltyShootoutFirstTen,
            SoccerBetType.HomePenaltyShootoutOverUnder => penaltyShootoutFirstTen,
            SoccerBetType.AwayPenaltyShootoutOverUnder => penaltyShootoutFirstTen,
            SoccerBetType.PenaltyShootoutCombo => penaltyShootoutFirstTen,
            SoccerBetType.PenaltyShootoutSuddenDead => PenaltyShootoutSuddenDeadGroup,
            _ => GetPenaltyShootoutRound(resourceId)
        };
    }

    private static int OtherGroup(int betTypeId)
    {
        const int extraTimeNextGoalGroup = 7;
        const int goalGroup = 9;
        const int cornerGroup = 10;
        return betTypeId switch
        {
            SoccerBetType.ExtraTimeNextGoal => extraTimeNextGoalGroup,
            SoccerBetType.FirstGoalMethod or SoccerBetType.TimeOfFirstGoal => goalGroup,
            _ => cornerGroup
        };
    }

    public string GetBetTypeName(int betTypeId, string resourceId)
    {
        return betTypeId switch
        {
            SoccerBetType.ExtraTimeNextGoal => $"Goal {Convert.ToUInt32(Round(resourceId))}",
            SoccerBetType.HomePenaltyShootout => refDataService.GetBetTypeName(betTypeId, Round(resourceId)),
            SoccerBetType.PenaltyShootoutBothOneNeither or SoccerBetType.PenaltyShootout1X2
                or SoccerBetType.PenaltyWoodwork => refDataService.GetBetTypeName(betTypeId, Round(resourceId)),
            SoccerBetType.HomePenaltyShootoutOverUnder => "Penalty Shootout First 10 - Home Score",
            SoccerBetType.AwayPenaltyShootoutOverUnder => "Penalty Shootout First 10 - Away Score",
            SoccerBetType.AwayPenaltyShootout => refDataService.GetBetTypeName(betTypeId, Round(resourceId)),
            _ => refDataService.GetBetTypeName(betTypeId)
        };
    }

    private static string Round(string resourceId)
    {
        const int pos = 3;
        const int maxLength = 2;
        return resourceId.Substring(pos, maxLength);
    }
}