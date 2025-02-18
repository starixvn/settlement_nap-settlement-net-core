using Microsoft.Extensions.Options;
using Polly;
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

        httpClient.Timeout = TimeSpan.FromMinutes(2);

        var policy = Policy
            .Handle<HttpRequestException>()
            .WaitAndRetryAsync(3, retryAttempt =>
                TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));

        var json = await policy.ExecuteAsync(async () =>
        {
            var response = await httpClient.PostAsync($"{apiUrl}{uri}", content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        });

        return string.IsNullOrEmpty(json) ? null : JsonSerializer.Deserialize<T>(json, GetOptions());
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

    private static async Task<T> FromHttpResponseMessage<T>(HttpResponseMessage response)
    {
        var json = await response.Content.ReadAsStringAsync();
        return string.IsNullOrEmpty(json) ? default : JsonSerializer.Deserialize<T>(json, GetOptions());
    }
}