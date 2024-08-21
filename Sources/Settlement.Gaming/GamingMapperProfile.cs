using AutoMapper;
using Settlement.Gaming.Criteria.NumberGame;
using Settlement.Gaming.Requests;

namespace Settlement.Gaming;

public class GamingMapperProfile : Profile
{
    public GamingMapperProfile()
    {
        CreateMap<NumberGameMatchRequest, GetNumberGameMatchCriteria>();
    }
}