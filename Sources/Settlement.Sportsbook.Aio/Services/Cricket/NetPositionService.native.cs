using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Constants.Cricket;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Requests;
using System.Text;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public interface NetPositionService
{
    Task<Result> UnCalculate(UpdateStatusServiceCriteria updateStatusServiceCriteria, List<ResultCommand> resultCommands);

    Task<Result> Calculate(UpdateStatusServiceCriteria updateStatusServiceCriteria, List<ResultCommand> resultCommands, bool isHedgeMatch);
}

public class NetPositionServiceImp : NetPositionService
{
    private readonly AppSettingsKey appSettingsKey;

    private static readonly HttpClient httpClient = new HttpClient();

    private readonly IDynamicRepository repository;

    public NetPositionServiceImp(IOptions<AppSettingsKey> appSettingsKey, IDynamicRepository repository)
    {
        this.appSettingsKey = appSettingsKey.Value;
        this.repository = repository;
    }

    public async Task<Result> UnCalculate(UpdateStatusServiceCriteria updateStatusServiceCriteria, List<ResultCommand> resultCommands)
    {
        foreach (var item in resultCommands)
        {
            updateStatusServiceCriteria.DbServer = item.DbServer;
            updateStatusServiceCriteria.ServiceCommand = item.ServiceCommand;
            updateStatusServiceCriteria.ServiceStatus = ServiceStatus.Waiting;
            await repository.ExecuteAsync(updateStatusServiceCriteria);
        }

        return new Result();
    }

    public async Task<Result> Calculate(UpdateStatusServiceCriteria updateStatusServiceCriteria, List<ResultCommand> resultCommands, bool isHedgeMatch)
    {
        const string messageError =
            "Failed to adjust Net Position of credit Members, consequently the match cannot be settled. Please arrange with the personnel in charge for the necessary action!\r\nDetails of the error:";

        var listResult = new List<Result>();

        foreach (var item in resultCommands)
        {
            updateStatusServiceCriteria.DbServer = item.DbServer;
            updateStatusServiceCriteria.ServiceCommand = item.ServiceCommand;
            updateStatusServiceCriteria.SiteDbGroupId = item.SiteDbGroupId;

            if (!isHedgeMatch && item.SiteDbGroupId == 0)
            {
                updateStatusServiceCriteria.StartTime = DateTime.Now;

                var result = await NetPosition(updateStatusServiceCriteria.MatchId, updateStatusServiceCriteria.Action);

                updateStatusServiceCriteria.EndTime = DateTime.Now;

                if (result.ErrCode > 0)
                {
                    updateStatusServiceCriteria.ServiceStatus = ServiceStatus.Failed;
                    updateStatusServiceCriteria.Reason = result.ErrMsg;

                    result.ErrMsg = $"{updateStatusServiceCriteria.DbServer}: {messageError} {result.ErrMsg}";
                    listResult.Add(result);
                }
            }

            await repository.ExecuteAsync(updateStatusServiceCriteria);
        }

        return await Task.FromResult(new Result
        {
            ErrMsg = string.Join(",", listResult.Select(r => r.ErrMsg).ToArray())
        });
    }

    private async Task<Result> NetPosition(int matchId, string action)
    {
        var request = new NetPositionRequest
        {
            MatchId = matchId,
            Action = action
        };

        if (string.IsNullOrWhiteSpace(appSettingsKey.NetPositionApi))
        {
            return new Result();
        }

        var api = $"{appSettingsKey.NetPositionApi}calculate";
        var requestContent = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8,
            "application/json");
        var response = await httpClient.PostAsync(new Uri(api), requestContent);
        response.EnsureSuccessStatusCode();
        var apiResponse = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<Result>(apiResponse);
    }
}