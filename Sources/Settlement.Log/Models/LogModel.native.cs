using Settlement.Core.Services;
using Constants = Settlement.Core.Constants;

namespace Settlement.Log.Models;

public class LogModel
{
    public IRefDataService RefDataService { get; set; }

    public int MatchId { get; set; }

    public string MatchCode { get; set; }

    public int HomeId { get; set; }

    public int AwayId { get; set; }

    public int LeagueId { get; set; }

    public string LeagueName => RefDataService.GetLeagueName(LeagueId);

    public string Home => RefDataService.GetTeamName(HomeId);

    public string Away => RefDataService.GetTeamName(AwayId);

    public string MatchName
    {
        get
        {
            if (SportType == Constants.SportType.NumberGame)
            {
                return $"Number Game No {MatchCode}";
            }
            else if (SportType == Constants.SportType.Happy5)
            {
                return $"No {MatchCode}";
            }
            else
            {
                return $"{Home} -vs- {Away}";
            }
        }
    }

    public int SportType { get; set; }

    public DateTime EventDate { get; set; }

    public List<LogDetailsModels> MatchLogDetails { get; set; }
}