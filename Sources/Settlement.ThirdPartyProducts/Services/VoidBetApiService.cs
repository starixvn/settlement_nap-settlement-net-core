using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using System.Text;
using ResourceItem = Settlement.ThirdPartyProducts.Models.ResourceItem;

namespace Settlement.ThirdPartyProducts.Services;

public interface IVoidBetApiService
{
    Task VoidBetApi(VoidBetRequest request);

    Task<List<VoidBetInfo>> GetTicketInfo(GetTicketInfo request);
}

public class VoidBetApiServiceImp : IVoidBetApiService
{
    private readonly IDynamicRepository repository;

    private readonly XmlConvertService xmlConvertService;

    private readonly SendMailService sendMailService;

    private readonly IMapper mapper;

    private readonly IRefDataService refDataService;

    private readonly IHttpClientFactory httpClientFactory;

    private readonly AppSettingsKey appSettingsKey;

    public VoidBetApiServiceImp(
        IDynamicRepository repository,
        XmlConvertService xmlConvertService,
        IMapper mapper,
        SendMailService sendMailService,
        IRefDataService refDataService,
        IHttpClientFactory httpClientFactory,
        IOptions<AppSettingsKey> appSettingsKey)

    {
        this.repository = repository;
        this.mapper = mapper;
        this.xmlConvertService = xmlConvertService;
        this.sendMailService = sendMailService;
        this.refDataService = refDataService;
        this.httpClientFactory = httpClientFactory;
        this.appSettingsKey = appSettingsKey.Value;
    }

    public async Task VoidBetApi(VoidBetRequest request)
    {
        var voidBetApiModel = new VoidBetApiModel
        {
            VoidBetInfos = request.VoidBetInfos
        };
        if (!string.IsNullOrEmpty(appSettingsKey.ThirdPartyJackTimeUrl) && voidBetApiModel.VoidBetInfos.Any())
        {
            await SendRequest(appSettingsKey.ThirdPartyJackTimeUrl, request, voidBetApiModel);
        }
    }

    private async Task SendRequest(string thirdPartyUrl, VoidBetRequest request, VoidBetApiModel model)
    {
        var apiUrl = JackTimeApi(thirdPartyUrl, request.Action);
        var requestContent = new StringContent(JsonConvert.SerializeObject(model), Encoding.UTF8, "application/json");
        var httpClient = httpClientFactory.CreateClient();
        var response = await httpClient.PostAsync(new Uri(apiUrl), requestContent);
        await HandleResponse(response, request, model);
    }

    private static string JackTimeApi(string thirdPartyUrl, string actionName)
    {
        const string voidBet = "VoidBet";
        const string undoVoidBet = "UndoVoidBet";
        var actionRequest = actionName.Equals(ActionType.UnCalculate) ? undoVoidBet : voidBet;
        return $"{thirdPartyUrl}{actionRequest}";
    }

    private async Task HandleResponse(HttpResponseMessage response, VoidBetRequest request, VoidBetApiModel model)
    {
        if (!response.IsSuccessStatusCode)
        {
            var mailModel = mapper.Map<VoidBetRequest, NotificationModel>(request);
            mailModel.RefDataService = refDataService;
            mailModel.Message = await response.Content.ReadAsStringAsync();
            mailModel.Action = $"CO-{mailModel.Action}-JackTime";
            mailModel.StartTime = DateTime.Now;
            mailModel.VoidBetInfos = model.VoidBetInfos;
            sendMailService.SendMail(mailModel);
        }
    }

    public async Task<List<VoidBetInfo>> GetTicketInfo(GetTicketInfo request)
    {
        var listResource = request.SelectedResources.Select(i => new ResourceItem(i)).ToList();
        var getTicketInfoCriteria = new GetTicketInfoCriteria
        {
            MatchId = request.MatchId,
            SelectedResources = CreateResources(listResource)
        };

        var listVoidBetInfo = new List<VoidBetInfo>();

        foreach (var server in appSettingsKey.SiteDbServer)
        {
            getTicketInfoCriteria.DbServer = server;
            var listVoidBet = (await repository.FetchAsync<VoidBetInfo>(getTicketInfoCriteria)).ToList();
            listVoidBetInfo.AddRange(listVoidBet);
        }

        return HandleListVoidBet(listVoidBetInfo, request.Action);
    }

    private static List<VoidBetInfo> HandleListVoidBet(List<VoidBetInfo> voidBetInfos, string action)
    {
        if (action.Equals(ActionType.UnCalculate))
        {
            const int statusIdRefund = 103;
            voidBetInfos = voidBetInfos.Where(item => item.StatusId == statusIdRefund).ToList();
        }

        return voidBetInfos;
    }

    private string CreateResources(List<ResourceItem> selectedResources)
    {
        var resources = new Models.Resources<ResourceItem>
        {
            ResourceItems = selectedResources
        };

        return xmlConvertService.Serialize(resources);
    }
}