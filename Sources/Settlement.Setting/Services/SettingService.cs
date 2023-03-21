using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Criteria;
using Settlement.Core.Models;
using Settlement.Setting.Criteria;
using Settlement.Setting.Models;
using Settlement.Setting.Requests;

namespace Settlement.Setting.Services;

public interface SettingService
{
    Task<Result> UpdateSettingLeague(SettingLeagueRequest query);

    Task<Result> UpdateSettingMatch(SettingMatchRequest query);

    Task<RemarkQueryModel> GetRemarkInfo(int matchId);

    Task UpdateRemarkSetting(UpdateRemarkRequest request);

    Task<Result> UpdateTimeSettingLeague(TimeSettingRequest request);

    Task<string> GetSetting(GetSettingRequest request);
}

public class SettingServiceImp : SettingService
{
    private readonly IDynamicRepository repository;

    private readonly INapSession currentSession;

    private readonly IHttpContextAccessor accessor;

    private readonly IMapper mapper;

    public SettingServiceImp(
        IDynamicRepository repository,
        INapSession currentSession,
        IHttpContextAccessor accessor,
        IMapper mapper)
    {
        this.repository = repository;
        this.currentSession = currentSession;
        this.accessor = accessor;
        this.mapper = mapper;
    }

    public async Task<Result> UpdateSettingLeague(SettingLeagueRequest query)
    {
        var criteria = mapper.Map<SettingLeagueRequest, UpdateSettingLeagueCriteria>(query);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg,
            ChildMatchIds = criteria.UpdatedMatchIds
        };
    }

    public async Task<Result> UpdateSettingMatch(SettingMatchRequest query)
    {
        var criteria = mapper.Map<SettingMatchRequest, UpdateSettingMatchCriteria>(query);
        criteria.AdminId = currentSession.UserId;
        criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    public async Task<RemarkQueryModel> GetRemarkInfo(int matchId)
    {
        var criteria = new GetRemarkInfoCriteria { MatchId = matchId };
        return await repository.GetAsync<RemarkQueryModel>(criteria);
    }

    public async Task UpdateRemarkSetting(UpdateRemarkRequest request)
    {
        var criteria = mapper.Map<UpdateRemarkRequest, UpdateRemarkCriteria>(request);
        criteria.AdminId = currentSession.UserId;
        await repository.ExecuteAsync(criteria);
    }

    public async Task<Result> UpdateTimeSettingLeague(TimeSettingRequest request)
    {
        var criteria = mapper.Map<TimeSettingRequest, UpdateTimeSettingLeagueCriteria>(request);
        criteria.AdminId = currentSession.UserId;

        await repository.ExecuteAsync(criteria);

        return new Result
        {
            ErrCode = criteria.ErrCode,
            ErrMsg = criteria.ErrMsg
        };
    }

    public async Task<string> GetSetting(GetSettingRequest request)
    {
        const int convertToBase = 2;
        var criteria = new GetSettingCriteria
        {
            MatchId = request.MatchId,
            LeagueId = request.LeagueId
        };

        var setting = await repository.GetAsync<int?>(criteria);

        return Convert.ToString(setting ?? 0, convertToBase).Reverse();
    }
}