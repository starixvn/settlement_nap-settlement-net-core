using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.ScaleOut.Criteria;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Outright.Criteria;
using Settlement.Outright.Requests;

namespace Settlement.Outright.Services;

public interface OutrightSettleService
{
    Task<LeagueInfo> GetLeagueInfo(GetLeagueInfoRequest request);

    Task<Result> Settle(SettleRequest request);
}

public class OutrightSettleServiceImp : OutrightSettleService
{
    private readonly IDynamicRepository repository;

    private readonly IMapper mapper;

    private readonly IRefDataService refDataService;

    private readonly ScaleOutSettleThirdPartyService scaleOutSettleService;

    private readonly AppSettingsKey appSettingsKey;

    public OutrightSettleServiceImp(IDynamicRepository repository,
        IMapper mapper,
        IRefDataService refDataService,
        ScaleOutSettleThirdPartyService scaleOutSettleService,
        IOptions<AppSettingsKey> appSettingsKey)
    {
        this.repository = repository;
        this.mapper = mapper;
        this.refDataService = refDataService;
        this.scaleOutSettleService = scaleOutSettleService;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task<LeagueInfo> GetLeagueInfo(GetLeagueInfoRequest request)
    {
        var criteria = mapper.Map<GetLeagueInfoRequest, GetLeagueInfoCriteria>(request);

        var listTeam = await repository.FetchAsync<Team>(criteria);

        return new LeagueInfo
        {
            Teams = listTeam,
            LeagueName = refDataService.GetLeagueName(request.LeagueId)
        };
    }

    public async Task<Result> Settle(SettleRequest request)
    {
        //var validateResult = await scaleOutSettleService.GetDeploymentInfo(new GetDeploymentInfoRequest { SPName = criteria.SpName });

        //if (validateResult.ErrorCode > 0)
        //{
        //    return new Result
        //    {
        //        ErrCode = validateResult.ErrorCode,
        //        ErrMsg = validateResult.ErrorMessage
        //    }; ;
        //}

        //var updateResult = await UpdateResult(criteria);
        //if (!updateResult.IsSuccessful)
        //{
        //    return updateResult;
        //}

        //return await OutrightSettleMultiSite(criteria);

        return new Result();
    }

    private async Task<Result> UpdateResult(OutrightSettleCriteria criteria)
    {
        var updateResultCriteria = new UpdateResultOutrightCriteria
        {
            MatchId = criteria.MatchId,
            Action = criteria.Action,
            Status = criteria.Status
        };

        await repository.ExecuteAsync(updateResultCriteria);

        return new Result
        {
            ErrCode = updateResultCriteria.ErrCode,
            ErrMsg = updateResultCriteria.ErrMsg
        };
    }

    private async Task<Result> OutrightSettleMultiSite(OutrightSettleCriteria criteria)
    {
        var results = new List<Result>();
        foreach (var server in appSettingsKey.SiteDbServer)
        {
            criteria.DbServer = server;
            await repository.ExecuteAsync(criteria);
            results = await ResultMessage(results, server, criteria.ErrMsg);
        }

        return new Result
        {
            ErrCode = results.Count,
            ErrMsg = string.Join("<br/>", results.Select(r => r.ErrMsg).ToArray())
        };
    }

    private async Task<List<Result>> ResultMessage(List<Result> results, string server, string message)
    {
        if (!string.IsNullOrWhiteSpace(message))
        {
            var siteDbGroupId = await GetSiteGroupId(server);
            var result = new Result
            {
                ErrMsg = $"- SiteDbGroupId {siteDbGroupId}: {message}"
            };

            results.Add(result);
        }

        return results;
    }

    private async Task<int> GetSiteGroupId(string dbServer)
    {
        var criteria = new GetSiteGroupCriteria { DbServer = dbServer };
        var site = await repository.GetAsync<SiteGroup>(criteria);
        return site.SiteDbGroupId;
    }
}