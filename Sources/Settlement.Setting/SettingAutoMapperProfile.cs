using AutoMapper;
using Settlement.Core.Criteria;
using Settlement.Setting.Criteria;
using Settlement.Setting.Criteria.OutsideSourceManager;
using Settlement.Setting.Criteria.ProviderManager;
using Settlement.Setting.Requests;
using Settlement.Setting.Requests.OutsideSourceManager;
using Settlement.Setting.Requests.ProviderManager;

namespace Settlement.Setting;

public class SettingAutoMapperProfile : Profile
{
    public SettingAutoMapperProfile()
    {
        CreateMap<TimeSettingRequest, UpdateTimeSettingLeagueCriteria>();
        CreateMap<SettingLeagueRequest, UpdateSettingLeagueCriteria>();
        CreateMap<SettingMatchRequest, UpdateSettingMatchCriteria>();
        CreateMap<GetProviderRequest, GetProviderCriteria>().ForMember(dest => dest.GameTypes, map => map.MapFrom(src => src.GameType));
        CreateMap<UpdateProviderRequest, UpdateProviderCriteria>();
        CreateMap<GetOutsideSourceRequest, GetOutsideSourceCriteria>();
        CreateMap<AddOutsideSourceRequest, AddOutsideSourceCriteria>();
        CreateMap<UpdateOutsideSourceRequest, UpdateOutsideSourceCriteria>().ForMember(dest => dest.IsActive, map => map.MapFrom(src => src.SourceStatus));
        CreateMap<GetLeagueOutsideSourceRequest, GetLeagueOutsideSourceCriteria>();
        CreateMap<UpdateLeagueOutsideSourceRequest, UpdateLeagueOutsideSourceCriteria>();
        CreateMap<UpdateRemarkRequest, UpdateRemarkCriteria>();
    }
}