using MediatR;
using Settlement.Core.Models;
using Settlement.FastMarkets.Requests;
using Settlement.FastMarkets.Services;
using System.Threading;
using System.Threading.Tasks;

namespace Settlement.FastMarkets.Handlers
{
    public class UpdateSettingHandler : IRequestHandler<SettingLeagueRequest, Result>,
        IRequestHandler<SettingMatchRequest, Result>,
        IRequestHandler<UpdateWaterBreakSettingRequest, Result>
    {
        private readonly ISettingService settingService;

        public UpdateSettingHandler(ISettingService settingService)
        {
            this.settingService = settingService;
        }

        public async Task<Result> Handle(SettingLeagueRequest request, CancellationToken cancellationToken) => await settingService.UpdateSettingLeague(request);

        public async Task<Result> Handle(SettingMatchRequest request, CancellationToken cancellationToken) => await settingService.UpdateSettingMatch(request);

        public async Task<Result> Handle(UpdateWaterBreakSettingRequest request, CancellationToken cancellationToken) => await settingService.UpdateWaterBreakSetting(request);
    }
}