using AutoMapper;
using Settlement.FastMarkets.Criteria;
using Settlement.FastMarkets.Requests;

namespace Settlement.FastMarkets
{
    public class FastMarketAutoMapperProfile : Profile
    {
        public FastMarketAutoMapperProfile()
        {
            CreateMap<SettleRequest, PushFastMarketResultCriteria>();
            CreateMap<SettingMatchRequest, UpdateSettingMatchCriteria>();
            CreateMap<SettingLeagueRequest, UpdateSettingLeagueCriteria>();
            CreateMap<UpdateWaterBreakSettingRequest, UpdateWaterBreakSettingCriteria>();
            CreateMap<UpdateWaterBreakSettingRequest, WriteLogUpdateWaterBreakCriteria>()
                .ForMember(dest => dest.UserId, map => map.MapFrom(src => src.AdminId));
            CreateMap<GetLastestResultRequest, GetLastestResultCriteria>();
            CreateMap<GetTimeMachineResultRequest, GetTimeMachineResultCriteria>();
        }
    }
}