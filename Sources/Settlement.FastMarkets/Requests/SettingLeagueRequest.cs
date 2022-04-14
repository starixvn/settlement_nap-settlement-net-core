using MediatR;
using Settlement.Core.Models;

namespace Settlement.FastMarkets.Requests
{
    public class SettingLeagueRequest : IRequest<Result>
    {
        public int LeagueId { get; set; }

        public bool IsEnabled { get; set; }

        public bool IsApplyAll { get; set; }
    }
}