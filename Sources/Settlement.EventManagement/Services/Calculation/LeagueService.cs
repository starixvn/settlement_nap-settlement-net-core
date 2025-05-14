namespace Settlement.EventManagement.Services.Calculation;

using Criteria;
using Models;
using Requests;
using Settlement.EventManagement.Models.Calculation;
using Match = Models.Calculation.Match;

public interface LeagueService
{
    Task<List<LeagueTypeModel>> Leagues(LeagueCalculationRequest request);

    List<League> Leagues(List<Match> matches);
}

public class LeagueServiceImp(IDynamicRepository repository, IMapper mapper) : LeagueService
{
    public async Task<List<LeagueTypeModel>> Leagues(LeagueCalculationRequest request)
    {
        var criteria = mapper.Map<LeagueCalculationRequest, LeagueCalculationCriteria>(request);
        return (await repository.FetchAsync<LeagueTypeModel>(criteria)).ToList();
    }

    public List<League> Leagues(List<Match> matches)
    {
        var currentLeague = 0;
        var leagues = new List<League>();
        var league = new League();
        foreach (var match in matches)
        {
            if (currentLeague.Equals(match.LeagueId))
            {
                league.Matches.Add(match);
            }
            else
            {
                league = new League
                {
                    Name = match.LeagueName,
                    LeagueId = match.LeagueId,
                    AutoCalcSetting = match.AutoCalcSetting,
                    InstantWaitingTime = match.InstantWaitingTime,
                    RefundWaitingTime = match.RefundWaitingTime,
                    DirectWaitingTime = match.DirectWaitingTime,
                    EnabledAutoRefund = match.EnabledAutoRefund,
                };

                league.Matches.Add(match);
                leagues.Add(league);
                currentLeague = match.LeagueId;
            }
        }

        return leagues.ToList();
    }
}