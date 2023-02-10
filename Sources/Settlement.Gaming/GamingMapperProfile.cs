using AutoMapper;
using Settlement.Gaming.Criteria.Happy5;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming;

public class GamingMapperProfile : Profile
{
    public GamingMapperProfile()
    {
        CreateMap<Happy5MatchRequest, GetMatchesCriteria>();
        CreateMap<NumberGameMatchRequest, GetNumberGameMatchCriteria>();
    }
}