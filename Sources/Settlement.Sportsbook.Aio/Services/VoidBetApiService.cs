using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Setting.Models.Notification;
using Settlement.Setting.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface IVoidBetApiService
    {
        Task VoidBetApi(VoidBetRequest request);
    }

    public class VoidBetApiServiceImp : IVoidBetApiService
    {
        private readonly IDynamicRepository repository;

        private readonly IConfiguration configuration;

        private readonly ICreateQueryService createQueryService;

        private readonly SendMailService sendMailService;

        private readonly IMapper mapper;

        private readonly IRefDataService refDataService;

        private static readonly HttpClient httpClient = new HttpClient();

        private const string UncalculateAction = "UNDO";

        private const string VoidBet = "VoidBet";

        private const string UndoVoidBet = "UndoVoidBet";

        public VoidBetApiServiceImp(
            IDynamicRepository repository,
            IConfiguration configuration,
            ICreateQueryService createQueryService,
            IMapper mapper,
            SendMailService sendMailService,
            IRefDataService refDataService)
        {
            this.repository = repository;
            this.configuration = configuration;
            this.mapper = mapper;
            this.createQueryService = createQueryService;
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
            var actionRequest = request.Action == UncalculateAction ? UndoVoidBet : VoidBet;
            var apiUrl = $"{thirdPartyUrl}{actionRequest}";
            var now = DateTime.Now;
            var requestContent = new StringContent(JsonConvert.SerializeObject(model), Encoding.UTF8,
                "application/json");
            var response = await httpClient.PostAsync(new Uri(apiUrl), requestContent);
            await HandleResponse(response, request, now, model);
        }

        private async Task HandleResponse(HttpResponseMessage response, VoidBetRequest request, DateTime startTime, VoidBetApiModel model)
        {
            if (!response.IsSuccessStatusCode)
            {
                var mailModel = mapper.Map<VoidBetRequest, NotificationModel>(request);
                mailModel.RefDataService = refDataService;
                mailModel.Message = await response.Content.ReadAsStringAsync();
                mailModel.Action = $"CO-{mailModel.Action}-JackTime";
                mailModel.StartTime = startTime;
                mailModel.VoidBetInfos = model.VoidBetInfos;
                sendMailService.SendMail(mailModel);
            }
        }

        private async Task<List<VoidBetInfo>> GetTicketInfo(VoidBetRequest request)
        {
            var listResource = request.SelectedResources.Select(i => new ResourceItem(i)).ToList();
            var getTicketInfoCriteria = new GetTicketInfoCriteria()
            {
                MatchId = request.MatchId,
                SelectedResources = createQueryService.CreateResources(listResource)
            };

            return (await repository.FetchAsync<VoidBetInfo>(getTicketInfoCriteria)).ToList();
        }
    }
}