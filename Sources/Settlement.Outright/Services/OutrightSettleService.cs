using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;
using Settlement.Outright.Requests;
using Settlement.Services.Outright;
using System.Text;

namespace Settlement.Outright.Services;

public interface OutrightSettleService
{
    Task<LeagueInfo> GetLeagueInfo(GetLeagueInfoRequest request);

    Task<Result> Uncalculate(OutrightUndoRequest request);
}

public class OutrightSettleServiceImp : OutrightSettleService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly IRefDataService refDataService;

    private readonly OutrightSettleProcessService outrightSettleProcessService;

    private readonly OutrightPermissionService permission;

    private readonly INapSession currentSession;

    private const string SpName = "NAP_Admin_Settlement_Outright";

    public OutrightSettleServiceImp(IDynamicRepository repository,
        IMapper mapper,
        IRefDataService refDataService,
        OutrightSettleProcessService outrightSettleProcessService,
        OutrightPermissionService permission,
        INapSession currentSession
        )
    {
        this.repository = repository;
        this.mapper = mapper;
        this.refDataService = refDataService;
        this.outrightSettleProcessService = outrightSettleProcessService;
        this.permission = permission;
        this.currentSession = currentSession;
    }

    public async Task<LeagueInfo> GetLeagueInfo(GetLeagueInfoRequest request)
    {
        var criteria = mapper.Map<GetLeagueInfoRequest, GetLeagueInfoCriteria>(request);

        var listTeam = (await repository.FetchAsync<Team>(criteria)).ToList();

        listTeam.ForEach(team => team.RefDataService = refDataService);

        return new LeagueInfo
        {
            Teams = listTeam,
            LeagueName = refDataService.GetLeagueName(request.LeagueId),
            Permission = permission.Permission
        };
    }

    public async Task<Result> Uncalculate(OutrightUndoRequest request)
    {
        var validateDeployment = await outrightSettleProcessService.ValidateDeployment(SpName);

        if (!validateDeployment.IsSuccessful)
        {
            return validateDeployment;
        }

        var listMatch = request.MatchIds.Split(',');
        var teamIds = request.TeamIds.Split(",");
        var errorMsg = new StringBuilder();
        var tasks = listMatch.Select((match, i) => Task.Run(async () =>
        {
            var criteria = new OutrightSettleCriteria
            { Action = ActionType.UnCalculate, AdminId = currentSession.UserId };
            criteria.MatchId = int.Parse(listMatch[i]);
            var result = await UpdateResultAndUndo(criteria);
            if (!result.IsSuccessful)
            {
                errorMsg = AppendMessage(errorMsg, teamIds[i], result.ErrMsg);
            }
        }));
        await Task.WhenAll(tasks);

        return new Result { ErrMsg = errorMsg.ToString() };
    }

    private StringBuilder AppendMessage(StringBuilder message, string teamId, string errorMessage)
    {
        var teamName = $"{refDataService.GetTeamName(teamId)}";
        var error = $"{teamName}: {errorMessage}";
        message.Append($"{error}<br/>");
        return message;
    }

    private async Task<Result> UpdateResultAndUndo(OutrightSettleCriteria criteria)
    {
        var updateResult = await outrightSettleProcessService.UpdateResultUndo(criteria);
        if (!updateResult.IsSuccessful)
        {
            return updateResult;
        }

        return await outrightSettleProcessService.OutrightSettleMultiSite(criteria);
    }
}