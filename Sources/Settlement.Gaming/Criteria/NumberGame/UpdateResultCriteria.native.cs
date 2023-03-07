using Fanex.Data.Repository;

namespace Settlement.Gaming.Criteria.NumberGame;

public class UpdateResultCriteria : NonQueryCommand
{
    public int MatchId { get; set; }

    public string BallResults { get; set; }

    public override string GetSettingKey()
    {
        return "NAP_UpdateNumberGameBalls";
    }

    public override bool IsValid()
    {
        return MatchId > 0;
    }
}