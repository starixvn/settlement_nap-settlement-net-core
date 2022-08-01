using AutoMapper;
using Settlement.Core.Criteria;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets
{
    public class FastMarketAutoMapperProfile : Profile
    {
        public FastMarketAutoMapperProfile()
        {
            CreateMap<SettleRequest, PushFastMarketResultCriteria>();
            CreateMap<UpdateWaterBreakSettingRequest, UpdateWaterBreakSettingCriteria>();
            CreateMap<UpdateWaterBreakSettingRequest, WriteLogUpdateWaterBreakCriteria>()
                .ForMember(dest => dest.UserId, map => map.MapFrom(src => src.AdminId));
            CreateMap<GetLastestResultRequest, GetLastestResultCriteria>();
            CreateMap<GetTimeMachineResultRequest, GetTimeMachineResultCriteria>();
            CreateMap<PushFastMarketResultCriteria, ValidateBeforePushCriteria>()
                .ForMember(dest => dest.SelectedResources, map => map.MapFrom(src => src.Results));
        }
    }
}