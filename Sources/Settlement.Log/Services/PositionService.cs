using Settlement.Log.Models.BetTypeElement;
using static Settlement.Core.Constants.BetType;

namespace Settlement.Log.Services;

public interface PositionService
{
    string PositionName(int betTypeId, BetTypeItemElement item);
}

public class PositionServiceImp : PositionService
{
    private readonly ResultService resultService;

    private const int TimeMachineHandicapScoreRange = 10;

    private const int InjuryTime = 45;

    private const string InjuryText = "44+";

    public PositionServiceImp(ResultService resultService)
    {
        this.resultService = resultService;
    }

    public string PositionName(int betTypeId, BetTypeItemElement item)
    {
        if (string.IsNullOrWhiteSpace(item.Result))
        {
            if (betTypeId is FastMarketBetType.TimeMachineHandicap or FastMarketBetType.TimeMachineOverUnder)
            {
                item.MinPosition = GetTimeMachinePosition(item.MinPosition);
                item.MaxPosition = GetTimeMachinePosition(item.MaxPosition);
                return $"{item.MinPosition}-{item.MaxPosition}";
            }

            return item.Position;
        }

        var arrayPosition = item.Position.Split(',');
        var arrayResult = item.Result.Split(',');
        var positionName = new List<string>();
        for (var i = 0; i < arrayResult.Length; i++)
        {
            var value = PositionAndResultName(betTypeId, arrayPosition[i], arrayResult[i]);
            positionName.Add(value);
        }

        if (betTypeId is FastMarketBetType.TimeMachineHandicap or FastMarketBetType.TimeMachineOverUnder)
        {
            item.MinPosition = GetTimeMachinePosition(item.MinPosition);
            item.MaxPosition = GetTimeMachinePosition(item.MaxPosition);
            return $"{item.MinPosition}-{item.MaxPosition}({string.Join(",", positionName)})";
        }

        return string.Join("; ", positionName);
    }

    private string PositionAndResultName(int betTypeId, string position, string result)
    {
        switch (betTypeId)
        {
            case FastMarketBetType.TimeMachineOverUnder:
                {
                    var positionName = GetTimeMachinePosition(position);
                    return $"{positionName}({result})";
                }
            case FastMarketBetType.TimeMachineHandicap:
                {
                    var home = Convert.ToInt32(result) % TimeMachineHandicapScoreRange;
                    var away = Convert.ToInt32(result) / TimeMachineHandicapScoreRange;
                    var positionName = GetTimeMachinePosition(position);

                    return $"{positionName}({home}-{away})";
                }
            default:
                return betTypeId == FastMarketBetType.NextOneMinuteSetPiece ? resultService.MinuteSetPieceResultName(position, result) : resultService.ResultName(position, result);
        }
    }

    private static string GetTimeMachinePosition(string position)
    {
        var temp = Convert.ToInt32(position);
        if (temp == InjuryTime)
        {
            return InjuryText;
        }

        return temp > InjuryTime ? (temp - 1).ToString() : position;
    }
}