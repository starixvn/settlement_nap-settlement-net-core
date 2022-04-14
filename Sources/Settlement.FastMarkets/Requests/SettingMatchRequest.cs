using MediatR;
using Settlement.Core.Models;

namespace Settlement.FastMarkets.Requests
{
    public class SettingMatchRequest : IRequest<Result>
    {
        public int MatchId { get; set; }

        public bool IsEnabled { get; set; }
    }
}