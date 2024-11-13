using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using System.Text;
using System.Text.Json;

namespace Settlement.Core.Services;

public class HttpService(HttpClient httpClient, IOptions<AppSettingsKey> appSettingsKey)
{
    public async Task<T> HttpGet<T>(string uri)
        where T : class
    {
        var apiUrl = appSettingsKey.Value.InternalApiBase;

        var result = await httpClient.GetAsync($"{apiUrl}{uri}");
        if (!result.IsSuccessStatusCode)
        {
            return null;
        }

        return await FromHttpResponseMessage<T>(result);
    }

    public async Task<T> HttpPost<T>(string uri, object dataToSend)
        where T : class
    {
        var content = ToJson(dataToSend);
        var apiUrl = appSettingsKey.Value.InternalApiBase;

        var result = await httpClient.PostAsync($"{apiUrl}{uri}", content);
        if (!result.IsSuccessStatusCode)
        {
            var message = await result.Content.ReadAsStringAsync();
            await Fanex.Logging.LogService.ErrorAsync(message);
            return null;
        }

        return await FromHttpResponseMessage<T>(result);
    }

    private static StringContent ToJson(object obj)
    {
        return new StringContent(JsonSerializer.Serialize(obj), Encoding.UTF8, "application/json");
    }

    private static JsonSerializerOptions GetOptions()
    {
        return new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true
        };
    }

    private static async Task<T> FromHttpResponseMessage<T>(HttpResponseMessage result)
    {
        return JsonSerializer.Deserialize<T>(await result.Content.ReadAsStringAsync(), GetOptions());
    }
}