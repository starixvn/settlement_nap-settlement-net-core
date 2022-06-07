using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Kaden.XmlConverter;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Settlement.Core.Constants;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.ThirdPartyProducts.Criteria;
using Settlement.ThirdPartyProducts.Models;
using Settlement.ThirdPartyProducts.Requests;

namespace Settlement.ThirdPartyProducts.Services
{
    public interface IVoidBetApiService
    {
        Task VoidBetApi(VoidBetRequest request);
    }

    public class VoidBetApiServiceImp : IVoidBetApiService
    {
        private readonly IDynamicRepository repository;

        private readonly IConfiguration configuration;

        private readonly XmlConvertService xmlConvertService;

        private readonly SendMailService sendMailService;

        private readonly IMapper mapper;

        private readonly IRefDataService refDataService;

        private static readonly HttpClient httpClient = new HttpClient();

        public VoidBetApiServiceImp(
            IDynamicRepository repository,
            IConfiguration configuration,
            XmlConvertService xmlConvertService,
            IMapper mapper,
            SendMailService sendMailService,
            IRefDataService refDataService)
        {
            this.repository = repository;
            this.configuration = configuration;
            this.mapper = mapper;
            this.xmlConvertService = xmlConvertService;
            this.sendMailService = sendMailService;
            this.refDataService = refDataService;
        }

        public async Task VoidBetApi(VoidBetRequest request)
        {
            var voidBetApiModel = new VoidBetApiModel
            {
                VoidBetInfos = await GetTicketInfo(request)
            };
            var thirdPartyUrl = configuration.GetSection("ThirdPartyJackTimeUrl").Value;
            if (!string.IsNullOrEmpty(thirdPartyUrl) && voidBetApiModel.VoidBetInfos.Any())
            {
                await SendRequest(thirdPartyUrl, request, voidBetApiModel);
            }
        }

        private async Task SendRequest(string thirdPartyUrl, VoidBetRequest request, VoidBetApiModel model)
        {
            var apiUrl = JackTimeApi(thirdPartyUrl, request.Action);
            var requestContent = new StringContent(JsonConvert.SerializeObject(model), Encoding.UTF8,"application/json");
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

        private async Task<List<VoidBetInfo>> GetTicketInfo(VoidBetRequest request)
        {
            var listResource = request.SelectedResources.Select(i => new ResourceItem(i)).ToList();
            var getTicketInfoCriteria = new GetTicketInfoCriteria
            {
                MatchId = request.MatchId,
                SelectedResources = CreateResources(listResource)
            };

            return (await repository.FetchAsync<VoidBetInfo>(getTicketInfoCriteria)).ToList();
        }

        private string CreateResources(List<ResourceItem> selectedResources)
        {
            var resources = new Resources<ResourceItem>
            {
                ResourceItems = selectedResources
            };

            return xmlConvertService.Serialize(resources);
        }
    }
}