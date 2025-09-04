using Settlement.Core.Services;
using Settlement.Sportsbook.Aio.Constants.Basketball;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services;

public interface IGenerateBetTypeNameService
{
    string GenerateBetTypeName(ResultDetail resultDetail);
}

public class GenerateBetTypeNameService(IRefDataService refDataService) : IGenerateBetTypeNameService
{
    private static readonly List<string> SpecialPerformanceType = ["677", "679"];
    public string GenerateBetTypeName(ResultDetail resultDetail)
    {

        if (GroupBetType.SinglePlayerType.Contains(resultDetail.BetType) || SpecialPerformanceType.Contains(resultDetail.BetType))
        {
            return GenerateSinglePlayerBetTypeName(resultDetail);
        }

        if (GroupBetType.PerformanceType.Contains(resultDetail.BetType))
        {
            return GeneratePerformanceBetTypeName(resultDetail);
        }

        return GroupBetType.MostPointsType.Contains(resultDetail.BetType) ? GenerateMostPointsBetTypeName(resultDetail) : resultDetail.BetTypeName;
    }


    private string GenerateSinglePlayerBetTypeName(ResultDetail resultDetail)
    {
        var matchingOddFlex = resultDetail.OddFlex.FirstOrDefault();
        return matchingOddFlex == null ? resultDetail.BetTypeName : resultDetail.BetTypeName.Replace("Player", matchingOddFlex.Info.PlayerName);
    }

    private string GeneratePerformanceBetTypeName(ResultDetail resultDetail)
    {
        var matchingOddFlex = resultDetail.OddFlex.FirstOrDefault();
        return matchingOddFlex == null ? resultDetail.BetTypeName : $"{matchingOddFlex.Info.PlayerName} {ParseOddFlex(matchingOddFlex.Info)}";
    }

    private string GenerateMostPointsBetTypeName(ResultDetail resultDetail)
    {
        if (resultDetail.OddFlex.Count() != 2)
        {
            return resultDetail.BetTypeName;
        }
        return $"{resultDetail.BetTypeName} - {resultDetail.OddFlex[0].Info.PlayerName} vs. {resultDetail.OddFlex[1].Info.PlayerName}";
    }

    private string ParseOddFlex(OddsInfoModel oddsInfo)
    {
        var parts = new List<string>();

        var statisticsPart = FormatStatisticsPart(oddsInfo.Statistics);
        if (statisticsPart.Any())
        {
            parts.AddRange(statisticsPart);
        }

        var resultsPart = FormatResultsPart(oddsInfo.Results, oddsInfo.TeamId);
        if (resultsPart.Any())
        {
            parts.AddRange(resultsPart);
        }

        return $"have {FormatFinalOutput(parts)}";
    }

    private List<string> FormatStatisticsPart(List<Statistic> statistics)
    {
        if (statistics?.Any() != true)
        {
            return [];
        }

        var validStats = statistics.Where(s => !string.IsNullOrEmpty(s.Type) && !string.IsNullOrEmpty(s.Value));
        var formattedStats = validStats.Select(FormatStatistic).ToList();

        return formattedStats.Any() ? formattedStats : [];
    }

    private string FormatStatistic(Statistic stat)
    {
        return stat.Type.ToLowerInvariant() == "three point" ? $"{stat.Value} {stat.Type} field goals" : $"{stat.Value} {stat.Type}";
    }

    private List<string> FormatResultsPart(List<ResultInfo> results, int teamId)
    {
        if (results?.Any() != true)
        {
            return [];
        }

        var teamName = refDataService.GetTeamName(teamId);
        var validResults = results.Where(r => !string.IsNullOrEmpty(r.Type) && !string.IsNullOrEmpty(r.Value));
        var formattedResults = validResults.Select(r => FormatResult(r, teamName)).ToList();

        return formattedResults.Any() ? formattedResults : [];
    }

    private string FormatResult(ResultInfo result, string teamName)
    {
        return result.Type.ToLowerInvariant() switch
        {
            "winner" => $"{teamName} to Win",
            "over" => $"{teamName} Total Points Over {result.Value}",
            "handicap" => $"{teamName} to win with Handicap ({result.Value})",
            _ => $"{result.Value} {result.Type}"
        };
    }

    private static string FormatFinalOutput(List<string> parts)
    {
        return parts.Count switch
        {
            0 => string.Empty,
            1 => parts[0],
            _ => $"{string.Join(", ", parts.Take(parts.Count - 1))} and {parts[^1]}"
        };
    }


}