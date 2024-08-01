using AutoMapper;
using Settlement.Setting.Criteria;
using Settlement.Setting.Criteria.LeagueSettings;
using Settlement.Setting.Criteria.OutsideSourceManager;
using Settlement.Setting.Criteria.ProviderManager;
using Settlement.Setting.Models.LeagueSettings;
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
        CreateMap<UpdateLeagueSettingQuery, UpdateLeagueSettingsCriteria>()
            .ForMember(des => des.Main_HasTrader, map => map.MapFrom(src => src.MainResultSettings.HasTrader))
            .ForMember(des => des.Main_NumberProvider,
                map => map.MapFrom(src => src.MainResultSettings.MinimumProvider))
            .ForMember(des => des.Main_PrimaryProvider,
                map => map.MapFrom(src => src.MainResultSettings.PrimaryProvider))
            .ForMember(des => des.Main_SecondaryProvider,
                map => map.MapFrom(src => src.MainResultSettings.SecondaryProvider))
            .ForMember(des => des.EAR_HasTrader, map => map.MapFrom(src => src.EarlyResultSettings.HasTrader))
            .ForMember(des => des.EAR_NumberProvider,
                map => map.MapFrom(src => src.EarlyResultSettings.MinimumProvider))
            .ForMember(des => des.EAR_PrimaryProvider,
                map => map.MapFrom(src => src.EarlyResultSettings.PrimaryProvider))
            .ForMember(des => des.EAR_SecondaryProvider,
                map => map.MapFrom(src => src.EarlyResultSettings.SecondaryProvider));
    }
}