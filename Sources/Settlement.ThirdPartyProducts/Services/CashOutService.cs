using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;
using Settlement.ThirdPartyProducts.Requests.CashOut;
using System.Text;
using ResourceItem = Settlement.ThirdPartyProducts.Models.ResourceItem;

namespace Settlement.ThirdPartyProducts.Services;

public interface IVoidBetApiService
{
    Task VoidBet(string action, VoidBetRequest request);

    Task PostResult(string action, object request);

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

    public async Task VoidBet(string action, VoidBetRequest request)
    {
        var voidBetApiModel = new VoidBetApiModel
        {
            VoidBetInfos = request.VoidBetInfos
        };
        var jackTimeApi = appSettingsKey.ThirdPartyUri.JackTimeTicket;

        if (!string.IsNullOrEmpty(jackTimeApi) && voidBetApiModel.VoidBetInfos.Any())
        {
            var apiUri = $"{jackTimeApi}{action}";
            var response = await PostAsync(apiUri, voidBetApiModel);
            await HandleResponse(response, request, voidBetApiModel);
        }
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
        var requestContent = new StringContent(JsonConvert.SerializeObject(request), Encoding.UTF8, "application/json");
        var httpClient = httpClientFactory.CreateClient();
        return await httpClient.PostAsync(new Uri(apiUri), requestContent);
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

        return listVoidBetInfo;
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