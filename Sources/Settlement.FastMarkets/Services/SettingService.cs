using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Models;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets.Services
{
    public interface ISettingService
    {
        Task<Result> UpdateWaterBreakSetting(UpdateWaterBreakSettingRequest request);
    }

    public class SettingServiceImp : ISettingService
    {
        private readonly IDynamicRepository repository;

        private readonly XmlConvertService xmlConvertService;

        private readonly IMapper mapper;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        public SettingServiceImp(IDynamicRepository repository,
            XmlConvertService xmlConvertService,
            IMapper mapper,
            INapSession currentSession,
            IHttpContextAccessor accessor)
        {
            this.repository = repository;
            this.xmlConvertService = xmlConvertService;
            this.mapper = mapper;
            this.accessor = accessor;
            this.currentSession = currentSession;
        }

        public async Task<Result> UpdateWaterBreakSetting(UpdateWaterBreakSettingRequest request)
        {
            request.AdminId = currentSession.UserId;
            request.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            var executeCriteria = mapper.Map<UpdateWaterBreakSettingRequest, UpdateWaterBreakSettingCriteria>(request);
            var writeLogCriteria = mapper.Map<UpdateWaterBreakSettingRequest, WriteLogUpdateWaterBreakCriteria>(request);

            executeCriteria.SpecialSession = CreateWaterBreakResources(request.WaterBreakDetail);
            await repository.ExecuteAsync(executeCriteria);
            await repository.ExecuteAsync(writeLogCriteria);

            return new Result
            {
                ErrCode = executeCriteria.ErrCode,
                ErrMsg = executeCriteria.ErrMsg
            };
        }

        private string CreateWaterBreakResources(WaterBreakModel waterBreakDetail)
        {
            var resources = new WaterBreakResource<WaterBreakModel>
            {
                Item = waterBreakDetail
            };

            return xmlConvertService.Serialize(resources);
        }
    }
}