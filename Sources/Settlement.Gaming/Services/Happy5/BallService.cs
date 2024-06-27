using Fanex.Data.Repository;
using Settlement.Gaming.Criteria.Happy5;
using Settlement.Gaming.Models;
using Settlement.Gaming.Models.Happy5;

namespace Settlement.Gaming.Services.Happy5;

public interface BallService
{
    Task<List<BallModel>> GetBalls(string matchIds);

    Task<List<BallModel>> GetBallsByMatchId(int matchId);

    List<BallModel> CorrectNumberBall(int matchId, List<BallModel> balls);

    string ResourcesBalls(List<BallModel> balls);
}

public class BallServiceImp(IDynamicRepository repository, XmlConvertService xmlConvertService)
    : BallService
{
    public async Task<List<BallModel>> GetBalls(string matchIds)
    {
        var criteria = new GetBallCriteria
        {
            MatchIds = matchIds
        };

        var ball = await repository.FetchAsync<BallModel>(criteria);

        return ball.ToList();
    }

    public async Task<List<BallModel>> GetBallsByMatchId(int matchId)
    {
        var balls = await GetBalls(matchId.ToString());

        return CorrectNumberBall(matchId, balls);
    }

    public List<BallModel> CorrectNumberBall(int matchId, List<BallModel> balls)
    {
        var newBalls = new List<BallModel>();
        var fiveBall = new List<byte> { 1, 2, 3, 4, 5 };
        foreach (var item in fiveBall)
        {
            var currentBall = balls.Find(b => b.Seq == item);
            var number = currentBall?.NumberBall ?? 0;
            var ball = new BallModel(matchId, item, number);
            newBalls.Add(ball);
        }

        return newBalls;
    }

    public string ResourcesBalls(List<BallModel> balls)
    {
        var resourceItems = new List<ResourcesItem>();
        foreach (var ball in balls)
        {
            var resource = new ResourcesItem
            {
                Seq = ball.Seq,
                NumberBall = ball.NumberBall
            };

            resourceItems.Add(resource);
        }

        var resources = new Resources
        {
            ResourceItems = resourceItems
        };

        return xmlConvertService.Serialize(resources);
    }
}