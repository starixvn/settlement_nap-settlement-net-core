using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Sportsbook.Aio.Constants;
using Settlement.Sportsbook.Aio.Requests;
using System.Text;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public interface NetPositionService
{
    Task<Result> NetPosition(NetPositionRequest request);
}

public class NetPositionServiceImp : NetPositionService
{
    private readonly AppSettingsKey appSettingsKey;

    private static readonly HttpClient httpClient = new HttpClient();

    public NetPositionServiceImp(IOptions<AppSettingsKey> appSettingsKey)
    {
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task<Result> NetPosition(NetPositionRequest request)
    {
        var api = NetPositionUrlApi(request.Action);
        var requestContent = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8,
            "application/json");
        var response = await httpClient.PostAsync(api, requestContent);
        response.EnsureSuccessStatusCode();
        var apiResponse = await response.Content.ReadAsStringAsync();
        return JsonConvert.DeserializeObject<Result>(apiResponse);
    }

    private Uri NetPositionUrlApi(string action)
    {
        var apiUrl = action.Equals(SettleType.Calculate)
            ? $"{appSettingsKey.NetPositionApi}calculate"
            : $"{appSettingsKey.NetPositionApi}un-calculate";

        return new Uri(apiUrl);
    }
}