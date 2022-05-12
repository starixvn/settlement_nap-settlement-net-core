using MediatR;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.OutsideSourceManager;
using Settlement.Setting.Requests.ProviderManager;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Settlement.Core.Services;
using Settlement.Core.ActionFilters;

namespace Settlement.Setting.Controllers
{
    [ApiController]
    [Route("api/setting")]
    [SessionAuthorize]
    public class SourceManagerController : ControllerBase
    {
        private readonly IMediator mediator;

        private readonly PermissionService permissionService;

        public SourceManagerController(IMediator mediator, PermissionService permissionService)
        {
            this.mediator = mediator;
            this.permissionService = permissionService;
        }

        [HttpGet]
        [Route("get-score-source-permission")]
        public IActionResult GetPermission()
        {
            return Ok(permissionService.Permission.CanChangeScoreSource);
        }

        [HttpPost]
        [Route("update-provider-source")]
        public async Task<IActionResult> UpdateProviderSource(UpdateProviderRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-provider-source")]
        public async Task<IActionResult> GetProviderSource(GetProviderRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-outside-source")]
        public async Task<IActionResult> GetOutsideSource(GetOutsideSourceRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("add-outside-source")]
        public async Task<IActionResult> AddOutsideSource(AddOutsideSourceRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("update-outside-source")]
        public async Task<IActionResult> UpdateOutsideSource(UpdateOutsideSourceRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("get-league-outside-source")]
        public async Task<IActionResult> GetLeagueOutsideSource(GetLeagueOutsideSourceRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));

        [HttpPost]
        [Route("update-league-outside-source")]
        public async Task<IActionResult> UpdateLeagueOutsideSource(UpdateLeagueOutsideSourceRequest request)
            => Ok(await mediator.Send(request).ConfigureAwait(false));
    }
}