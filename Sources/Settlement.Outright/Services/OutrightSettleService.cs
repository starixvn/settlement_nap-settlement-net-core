using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;

namespace Settlement.Outright.Services;

public interface OutrightSettleService
{
    Task<LeagueInfo> GetLeagueInfo(GetLeagueInfoRequest request);

    Task<ResultOutright> Uncalculate(OutrightUndoRequest request);

    Task<ResultOutright> Calculate(OutrightCalculateRequest request);
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

    private readonly List<string> runningStatus = new() { EventStatus.Running, EventStatus.Closed, EventStatus.Internal };

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

    public async Task<ResultOutright> Uncalculate(OutrightUndoRequest request)
    {
        var infoValidate = GetListInfoValidates(request);

        var validateDeployment = await outrightSettleProcessService.ValidateRequest(SpName, infoValidate);

        if (!validateDeployment.IsSuccessful)
        {
            return validateDeployment;
        }

        var listMatch = request.MatchIds.Split(',');
        var teamIds = request.TeamIds.Split(",");
        var teamSettleFailed = new List<string>();

        var tasks = listMatch.Select((matchId, i) => PushRequestUncalculate(int.Parse(matchId), teamIds[i], teamSettleFailed));

        var listResult = await Task.WhenAll(tasks.ToArray());

        return HandleResult(listResult, teamSettleFailed);
    }

    public async Task<ResultOutright> Calculate(OutrightCalculateRequest request)
    {
        var infoValidate = request.Teams.Select(team => new InfoValidate(team.MatchId.ToString(), team.TeamId, team.EventDate));
        var validateDeployment = await outrightSettleProcessService.ValidateRequest(SpName, infoValidate);

        if (!validateDeployment.IsSuccessful)
        {
            return validateDeployment;
        }

        var teamSettleFailed = new List<string>();

        var tasks = request.Teams.Select(match => PushRequestCalculate(match, request.DeadHeat, teamSettleFailed));
        var listResult = await Task.WhenAll(tasks.ToArray());

        return HandleResult(listResult, teamSettleFailed);
    }

    private static IEnumerable<InfoValidate> GetListInfoValidates(OutrightUndoRequest request)
    {
        var listMatch = request.MatchIds.Split(',');
        var listTeamId = request.TeamIds.Split(',');

        return listMatch.Select((t, i) => new InfoValidate(t, listTeamId[i])).ToList();
    }

    private async Task<Result> PushRequestUncalculate(int matchId, string teamId, ICollection<string> teamSettleFailed)
    {
        var result = await UpdateResultAndUndo(matchId);
        if (result.IsSuccessful)
        {
            return result;
        }

        result.ErrMsg = Message(teamId, result.ErrMsg);
        teamSettleFailed.Add(matchId.ToString());

        return result;
    }

    private async Task<Result> PushRequestCalculate(TeamSettleModel team, int deadHeat, ICollection<string> teamSettleFailed)
    {
        var result = await SettleMatch(team, deadHeat);
        if (result.IsSuccessful)
        {
            return result;
        }

        result.ErrMsg = Message(team.TeamId, result.ErrMsg);
        teamSettleFailed.Add(team.MatchId.ToString());

        return result;
    }

    private static ResultOutright HandleResult(IEnumerable<Result> results, IReadOnlyCollection<string> teamSettleFailed)
    {
        var messageFailed = results.Where(result => !result.IsSuccessful).Select(result => result.ErrMsg);
        return new ResultOutright { ErrMsg = string.Join("", messageFailed), TeamFailedIds = teamSettleFailed.Count > 0 ? string.Join(',', teamSettleFailed) : string.Empty };
    }

    private async Task<Result> SettleMatch(TeamSettleModel team, int deadHeat)
    {
        var criteria = mapper.Map<TeamSettleModel, OutrightSettleCriteria>(team);
        criteria.Action = ActionType.CalculateAll;
        criteria.AdminId = currentSession.UserId;
        criteria.Deadheat = team.IsDeadheat ? deadHeat : null;
        var updateResult = await outrightSettleProcessService.UpdateResultCalculate(criteria);
        if (!updateResult.IsSuccessful)
        {
            return updateResult;
        }

        return await outrightSettleProcessService.OutrightSettleMultiSite(criteria);
    }

    private string Message(string teamId, string errorMessage)
    {
        var teamName = $"{refDataService.GetTeamName(teamId)}";
        return $"{teamName}: {errorMessage}<br/>";
    }

    private async Task<Result> UpdateResultAndUndo(int matchId)
    {
        var criteria = new OutrightSettleCriteria
        {
            Action = ActionType.UnCalculate,
            AdminId = currentSession.UserId,
            MatchId = matchId
        };
        var updateResult = await outrightSettleProcessService.UpdateResultUndo(criteria);
        if (!updateResult.IsSuccessful)
        {
            return updateResult;
        }

        return await outrightSettleProcessService.OutrightSettleMultiSite(criteria);
    }

    private IEnumerable<Team> SortTeam(IEnumerable<Team> teams)
    {
        return teams.OrderByDescending(t => runningStatus.Exists(s => s == t.OddsStatus.ToLowerInvariant())).ThenBy(t => t.TeamName);
    }
}