using AutoMapper;
using Settlement.Outright.Criteria;

namespace Settlement.Outright;

public class OutrightMapperProfile : Profile
{
    public OutrightMapperProfile()
    {
        CreateMap<SportLeagueRequest, GetOutrightSportLeaguesCriteria>();
        CreateMap<FilterRequest, GetOutrightDetailCriteria>();
        CreateMap<GetLeagueInfoRequest, GetLeagueInfoCriteria>();
        CreateMap<TeamSettleModel, OutrightSettleCriteria>();
        CreateMap<OutrightSettleCriteria, UpdateResultOutrightCriteria>();
    }
}