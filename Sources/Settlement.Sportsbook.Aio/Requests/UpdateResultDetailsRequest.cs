using Settlement.Core.Models;
using ResultDetail = Settlement.Sportsbook.Aio.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.Requests;

public record UpdateResultDetailsRequest(int MatchId, List<ResultDetail> ResultDetails, bool IsConfirm)
    : IRequest<Result>;