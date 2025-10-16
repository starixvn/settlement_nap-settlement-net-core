using Fanex.NAP.Client;
using Settlement.Core;
using Settlement.Core.Constants;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio.Handlers;

public class UpdateResultDetailsHandler : IRequestHandler<UpdateResultDetailsRequest, Result>
{
    private readonly IDynamicRepository repository;
    private readonly XmlConvertService xmlConvertService;
    private readonly INapSession napSession;

    private const int saveScoreLogActionId = 81059;
    private const int clearConfirmStatusLogId = 81066;

    public UpdateResultDetailsHandler(IDynamicRepository repository, XmlConvertService xmlConvertService, INapSession napSession)
    {
        this.repository = repository;
        this.xmlConvertService = xmlConvertService;
        this.napSession = napSession;
    }

    public async Task<Result> Handle(UpdateResultDetailsRequest request, CancellationToken cancellationToken)
    {
        var updateCriteria = Create(request);

        await repository.ExecuteAsync(updateCriteria);

        if (updateCriteria.ErrCode == 0)
        {
            await WriteLog(request);
            return new Result();
        }

        return new Result
        {
            ErrCode = updateCriteria.ErrCode,
            ErrMsg = updateCriteria.ErrMsg
        };
    }

    private UpdateResultDetailsCriteria Create(UpdateResultDetailsRequest request)
    {
        var resourceItems = request.ResultDetails.Select(x => new StatusResourceItem
        {
            ResourceId = x.ResourceId,
            HomeValue = x.HomeValue,
            AwayValue = x.AwayValue,
            ResultStatusId = request.IsConfirm ? ResultStatus.Confirmed : ResultStatus.Live,
            OtherInfo = x.OtherInfo
        }).ToList();

        return new UpdateResultDetailsCriteria
        {
            MatchId = request.MatchId,
            SelectedResources = CreateResources(resourceItems),
            UserId = napSession.UserId
        };
    }


    private string CreateResources<T>(List<T> selectedResources) where T : ResourceItem, new()
    {
        var resources = new Resources<T>
        {
            ResourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }

    private async Task WriteLog(UpdateResultDetailsRequest request)
    {
        var actionId = request.IsConfirm ? saveScoreLogActionId : clearConfirmStatusLogId;
        var remark = request.IsConfirm ? string.Join(",", request.ResultDetails.Select(x => $"{x.ResourceId}({x.HomeValue})"))
            : string.Join(",", request.ResultDetails.Select(x => x.ResourceId));

        var logCriteria = new LogCriteria(request.MatchId, remark, actionId, napSession.UserId);

        await repository.ExecuteAsync(logCriteria);
    }
}
