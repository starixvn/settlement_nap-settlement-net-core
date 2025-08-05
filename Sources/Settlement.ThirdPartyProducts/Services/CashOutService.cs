using AutoMapper;
using Fanex.Data.Repository;
using Fanex.Settlement.MessageBridge.JackTime;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Requests;
using System.Text;
using CashOutAction = Settlement.ThirdPartyProducts.Constants.CashOutAction;
using ResourceItem = Settlement.ThirdPartyProducts.Models.ResourceItem;
using VoidBetRequest = Settlement.ThirdPartyProducts.Requests.CashOut.VoidBetRequest;

namespace Settlement.ThirdPartyProducts.Services;

public interface IVoidBetApiService
{
    Task VoidBet(VoidBetRequest request);

    Task PostResult(string action, object request);

    Task<List<VoidBetInfo>> GetTicketInfo(GetTicketInfo request);
}

public class VoidBetApiServiceImp(
    IDynamicRepository repository,
    XmlConvertService xmlConvertService,
    IMapper mapper,
    SendMailService sendMailService,
    IRefDataService refDataService,
    IHttpClientFactory httpClientFactory,
    IOptions<AppSettingsKey> appSettingsKey)
    : IVoidBetApiService
{
    private readonly AppSettingsKey appSettingsKey = appSettingsKey.Value;

    public async Task VoidBet(VoidBetRequest request)
    {
        var cashOutApi = appSettingsKey.ThirdPartyUri.JackTimeTicket;

        if (!string.IsNullOrEmpty(cashOutApi) && request.VoidBetInfos.Any())
        {
            await CallApiVoidBet(request, cashOutApi);
        }
    }

    private async Task CallApiVoidBet(VoidBetRequest request, string cashOutApi)
    {
        var actions = request.VoidBetInfos
            .GroupBy(m => m.Action)
            .Select(m => m.Key);

        foreach (var action in actions)
        {
            var voidBetInfos = request.VoidBetInfos.Where(m => m.Action == action);
            var actionApi = GetActionApi(action);
            var apiUri = $"{cashOutApi}{actionApi}";
            var voidBetApiModel = new VoidBetApiModel
            {
                VoidBetInfos = voidBetInfos
            };
            var response = await PostAsync(apiUri, voidBetApiModel);
            await HandleResponse(response, request, voidBetApiModel);
        }
    }

    private static string GetActionApi(string action)
    {
        return action.Equals(ActionType.UnCalculate, StringComparison.OrdinalIgnoreCase)
            ? CashOutAction.UndoVoidBet
            : CashOutAction.VoidBet;
    }

    public async Task PostResult(string action, object request)
    {
        var jackTimeApi = appSettingsKey.ThirdPartyUri.JackTimeResult;

        if (!string.IsNullOrEmpty(jackTimeApi))
        {
            var apiUri = $"{jackTimeApi}{action}";
            await PostAsync(apiUri, request);
        }
    }

    private async Task<HttpResponseMessage> PostAsync(string apiUri, object request)
    {
        try
        {
            var requestContent = new StringContent(JsonConvert.SerializeObject(request, new JsonSerializerSettings
            {
                ContractResolver = new IgnorePropertiesResolver(["Action"])
            }), Encoding.UTF8, "application/json");
            var httpClient = httpClientFactory.CreateClient();
            return await httpClient.PostAsync(new Uri(apiUri), requestContent);
        }
        catch (Exception exception)
        {
            await Fanex.Logging.LogService.ErrorAsync($"Settlement.WebSites (Call JackTime API): {apiUri}", exception);
            return new HttpResponseMessage();
        }
    }

    private async Task HandleResponse(HttpResponseMessage response, VoidBetRequest request, VoidBetApiModel model)
    {
        if (!response.IsSuccessStatusCode)
        {
            var mailModel = CreateNotificationModel(request, model, await response.Content.ReadAsStringAsync());
            sendMailService.SendMail(mailModel);
        }
    }

    private NotificationModel CreateNotificationModel(VoidBetRequest request, VoidBetApiModel model, string message)
    {
        var mailModel = mapper.Map<VoidBetRequest, NotificationModel>(request);
        mailModel.RefDataService = refDataService;
        mailModel.Message = message;
        mailModel.Action = $"CO-{mailModel.Action}-JackTime";
        mailModel.StartTime = DateTimeOffset.Now.DateTime;
        mailModel.VoidBetInfos = model.VoidBetInfos;
        return mailModel;
    }

    public async Task<List<VoidBetInfo>> GetTicketInfo(GetTicketInfo request)
    {
        var getTicketInfoCriteria = mapper.Map<GetTicketInfo, GetTicketInfoCriteria>(request);
        getTicketInfoCriteria.SelectedResources = CreateResources(request.SelectedResources);

        var tasks = appSettingsKey.SiteDbServer.Select(async server =>
        {
            getTicketInfoCriteria.DbServer = server;
            return await repository.FetchAsync<VoidBetInfo>(getTicketInfoCriteria);
        });

        var results = await Task.WhenAll(tasks);
        return results.SelectMany(list => list).ToList();
    }

    private string CreateResources(IEnumerable<ResourceItem> selectedResources)
    {
        var resources = new Models.Resources<ResourceItem>
        {
            ResourceItems = selectedResources.ToList()
        };

        return xmlConvertService.Serialize(resources);
    }
}