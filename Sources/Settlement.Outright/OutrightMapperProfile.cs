using AutoMapper;
using Settlement.Outright.Criteria;

namespace Settlement.Outright;

public class OutrightMapperProfile : Profile
{
	public OutrightMapperProfile()
	{
		CreateMap<LeagueRequest, GetOutrightLeaguesCriteria>();
		CreateMap<FilterRequest, GetOutrightDetailCriteria>();
		CreateMap<GetLeagueInfoRequest, GetLeagueInfoCriteria>();
		CreateMap<TeamSettleModel, OutrightSettleCriteria>();
		CreateMap<OutrightSettleCriteria, UpdateResultOutrightCriteria>();
	}
}