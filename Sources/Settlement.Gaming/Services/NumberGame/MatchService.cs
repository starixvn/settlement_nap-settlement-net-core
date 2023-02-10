using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Models.NumberGame;
using Settlement.Gaming.Requests;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Settlement.Gaming.Models;

namespace Settlement.Gaming.Services.NumberGame;

public interface MatchService
{
    Task<List<BallModel>> Balls(NumberGameBallsRequest request);

    Task<List<MatchDetailModel>> Matches(NumberGameMatchRequest request);

}

public class MatchServiceImp : MatchService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    public MatchServiceImp(
        IDynamicRepository repository,
        IMapper mapper)
    {
        this.repository = repository;
        this.mapper = mapper;
    }

    public async Task<List<MatchDetailModel>> Matches(NumberGameMatchRequest request)
    {
        var criteria = mapper.Map<NumberGameMatchRequest, GetNumberGameMatchCriteria>(request);
        var matches = (await repository.FetchAsync<MatchDetailModel>(criteria)).ToList();
        return GroupMatchBalls(matches);
    }

    private static List<MatchDetailModel> GroupMatchBalls(List<MatchDetailModel> matches)
    {
        var matchList = matches.GroupBy(m => new
        {
            m.BetStatus,
            m.LeagueId,
            m.MatchId,
            m.MatchCode,
            m.EventDate,
            m.KickOffTime,
            m.EventStatus,
        });

        return matchList.Select(g => new MatchDetailModel
        {
            MatchId = g.Key.MatchId,
            MatchCode = g.Key.MatchCode,
            LeagueId = g.Key.LeagueId,
            EventDate = g.Key.EventDate,
            KickOffTime = g.Key.KickOffTime,
            BetStatus = g.Key.BetStatus,
            EventStatus = g.Key.EventStatus,
            Number = string.Join(",", g.Select(m => m.Number))
        }).ToList();
    }

    public async Task<List<BallModel>> Balls(NumberGameBallsRequest request)
    {
        var criteria = new GetMatchDetailCriteria { MatchId = request.MatchId };
        return (await repository.FetchAsync<BallModel>(criteria)).ToList();
    }
}