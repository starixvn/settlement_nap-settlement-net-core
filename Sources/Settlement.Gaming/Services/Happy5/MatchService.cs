using AutoMapper;
using Fanex.Data.Repository;
using Settlement.Gaming.Criteria.Happy5;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.Happy5;
using Settlement.Gaming.Requests;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Settlement.Gaming.Services.Happy5
{
    public interface MatchService
    {
        Task<List<MatchDetail>> Matches(Happy5MatchRequest request);
    }

    public class MatchServiceImp : MatchService
    {
        private readonly IDynamicRepository repository;

        private readonly BallService ballService;

        private readonly IMapper mapper;

        public MatchServiceImp(
            IDynamicRepository repository,
            BallService ballService,
            IMapper mapper)
        {
            this.repository = repository;
            this.ballService = ballService;
            this.mapper = mapper;
        }

        public async Task<List<MatchDetail>> Matches(Happy5MatchRequest request)
        {
            var criteria = mapper.Map<Happy5MatchRequest, GetMatchesCriteria>(request);
            var matches = (await repository.FetchAsync<MatchDetail>(criteria)).ToList();
            var balls = await GetBallsByMatchIds(matches);

            matches.ForEach(m => m.Balls = balls.ContainsKey(m.MatchId) ? ballService.CorrectNumberBall(m.MatchId, balls[m.MatchId]) : new List<BallModel>());

            return matches;
        }

        private async Task<Dictionary<int, List<BallModel>>> GetBallsByMatchIds(List<MatchDetail> matches)
        {
            if (matches.Any())
            {
                var matchIdsAsString = string.Join(",", matches.Select(x => x.MatchId));
                var balls = await ballService.GetBalls(matchIdsAsString);
                return balls.GroupBy(b => b.MatchId)
                    .ToDictionary(m => m.Key, m => m.ToList());
            }
            else
            {
                return new Dictionary<int, List<BallModel>>();
            }
        }
    }
}