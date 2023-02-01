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

    Task<Result> Calculate(OutrightCalculateRequest request);
}

public class OutrightSettleServiceImp : OutrightSettleService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly IRefDataService refDataService;

    private readonly OutrightSettleProcessService outrightSettleProcessService;

    private readonly OutrightPermissionService permission;

    private readonly INapSession currentSession;

    private readonly IBalanceUpService balanceUpService;

    private const string SpName = "NAP_Admin_Settlement_Outright";

    public OutrightSettleServiceImp(IDynamicRepository repository,
        IMapper mapper,
        IRefDataService refDataService,
        OutrightSettleProcessService outrightSettleProcessService,
        OutrightPermissionService permission,
        INapSession currentSession,
        IBalanceUpService balanceUpService
        )
    {
        this.repository = repository;
        this.mapper = mapper;
        this.refDataService = refDataService;
        this.outrightSettleProcessService = outrightSettleProcessService;
        this.permission = permission;
        this.currentSession = currentSession;
        this.balanceUpService = balanceUpService;
    }

    public async Task<LeagueInfo> GetLeagueInfo(GetLeagueInfoRequest request)
    {
        var criteria = mapper.Map<GetLeagueInfoRequest, GetLeagueInfoCriteria>(request);

        var listTeam = (await repository.FetchAsync<Team>(criteria)).ToList();

        listTeam.ForEach(team => team.RefDataService = refDataService);

        return new LeagueInfo
        {
            Teams = SortTeam(listTeam),
            LeagueName = refDataService.GetLeagueName(request.LeagueId),
            Permission = permission.Permission,
            MoveBetsDay = balanceUpService.GetBalanceUpDay().MoveBetsDay.AddDays(1),
            SportName = refDataService.GetSportName(request.SportType)
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
            var result = await UpdateResultAndUndo(int.Parse(match));
            if (!result.IsSuccessful)
            {
                errorMsg = AppendMessage(errorMsg, teamIds[i], result.ErrMsg);
            }
        }));
        await Task.WhenAll(tasks);

        return new Result { ErrMsg = errorMsg.ToString() };
    }

    public async Task<Result> Calculate(OutrightCalculateRequest request)
    {
        var validateDeployment = await outrightSettleProcessService.ValidateDeployment(SpName);

        if (!validateDeployment.IsSuccessful)
        {
            return validateDeployment;
        }

        var errorMsg = new StringBuilder();
        var tasks = request.Teams.Select((match) => Task.Run(async () =>
        {
            var result = await SettleMatch(match);
            if (!result.IsSuccessful)
            {
                errorMsg = AppendMessage(errorMsg, match.teamId, result.ErrMsg);
            }
        }));
        await Task.WhenAll(tasks);

        return new Result { ErrMsg = errorMsg.ToString() };
    }

    private async Task<Result> SettleMatch(TeamSettleModel team)
    {
        var criteria = mapper.Map<TeamSettleModel, OutrightSettleCriteria>(team);
        criteria.Action = ActionType.CalculateAll;
        criteria.AdminId = currentSession.UserId;
        var updateResult = await outrightSettleProcessService.UpdateResultCalculate(criteria, team.EventDate);
        if (!updateResult.IsSuccessful)
        {
            return updateResult;
        }

        return await outrightSettleProcessService.OutrightSettleMultiSite(criteria);
    }

    private StringBuilder AppendMessage(StringBuilder message, string teamId, string errorMessage)
    {
        var teamName = $"{refDataService.GetTeamName(teamId)}";
        var error = $"{teamName}: {errorMessage}";
        message.Append($"{error}<br/>");
        return message;
    }

    private async Task<Result> UpdateResultAndUndo(int matchId)
    {
        var criteria = new OutrightSettleCriteria
        { Action = ActionType.UnCalculate, AdminId = currentSession.UserId };
        criteria.MatchId = matchId;
        var updateResult = await outrightSettleProcessService.UpdateResultUndo(criteria);
        if (!updateResult.IsSuccessful)
        {
            return updateResult;
        }

        return await outrightSettleProcessService.OutrightSettleMultiSite(criteria);
    }

    private static IEnumerable<Team> SortTeam(IEnumerable<Team> teams)
    {
        return teams.OrderByDescending(t => t.OddsStatus.ToLowerInvariant() == EventStatus.Running).ThenBy(t => t.TeamName);
    }
}