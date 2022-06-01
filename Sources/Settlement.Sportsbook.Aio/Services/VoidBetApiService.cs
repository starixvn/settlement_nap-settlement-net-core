using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Fanex.Data.Repository;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Settlement.Setting.Services;
using Settlement.Sportsbook.Aio.Criteria;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Requests;
using ResultDetail = Settlement.Core.Models.ResultDetail;

namespace Settlement.Sportsbook.Aio.Services
{
    public interface IVoidBetApiService
    {
        Task VoidBet(VoidBetRequest request);
    }

    public class VoidBetApiServiceImp : IVoidBetApiService
    {
        private readonly IDynamicRepository repository;

        private readonly IConfiguration configuration;

        private readonly ICreateQueryService createQueryService;

        private readonly SendMailService sendMailService;

        private static readonly HttpClient httpClient = new HttpClient();

        public VoidBetApiServiceImp(
            IDynamicRepository repository,
            IConfiguration configuration,
            ICreateQueryService createQueryService,
            SendMailService sendMailService)
        {
            this.repository = repository;
            this.configuration = configuration;
            this.createQueryService = createQueryService;
        }

        public async Task VoidBet(VoidBetRequest request)
        {
            var listVoidBetInfos = await GetTicketInfo(request);
            var apiUrl = configuration.GetSection("ThirdPartyJackTimeUrl").Value;

            if (!string.IsNullOrEmpty(apiUrl) && listVoidBetInfos != null)
            {
                var requestContent = new StringContent(JsonConvert.SerializeObject(listVoidBetInfos), Encoding.UTF8,
                    "application/json");
                var response = await httpClient.PostAsync(new Uri(apiUrl), requestContent);
                HandleResponse(response);
            }
        }

        private void HandleResponse(HttpResponseMessage response)
        {
            if (!response.IsSuccessStatusCode)
            {
                // var mailModel =
                //sendMailService.SendMail();
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

            return await repository.GetAsync<List<VoidBetInfo>>(getTicketInfoCriteria);
        }
    }
}