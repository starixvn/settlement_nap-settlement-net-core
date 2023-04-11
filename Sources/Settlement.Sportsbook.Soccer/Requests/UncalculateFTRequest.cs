using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class UncalculateFtRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public bool IsExistFgLg { get; set; }

    public bool IsExistHtFgLg { get; set; }

    public bool IsExistFgNg { get; set; }

    public bool IsEnabledGoalRecordFt { get; set; }

    public IEnumerable<ResultDetail> ResultDetails { get; set; }
}