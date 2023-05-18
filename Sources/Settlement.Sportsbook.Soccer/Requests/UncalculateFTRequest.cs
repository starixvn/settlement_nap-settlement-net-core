using MediatR;
using Settlement.Core.Models;

namespace Settlement.Sportsbook.Soccer.Requests;

public class UncalculateFtRequest : IRequest<Result>
{
    public int MatchId { get; set; }

    public int AdminId { get; set; }

    public bool IsExistFgLg { get; set; }

    public bool IsExistHtFgLg { get; set; }

    public bool IsExistFgNg { get; set; }

    public int HedgeMatchId { get; set; }

    public bool IsApplyHedging { get; set; }

    public int? HalfTimeHome { get; set; }

    public int? HalfTimeAway { get; set; }

    public IEnumerable<ResultDetail> ResultDetails { get; set; }
}