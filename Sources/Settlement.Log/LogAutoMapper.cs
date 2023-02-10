using AutoMapper;
using Settlement.Log.Criteria;
using Settlement.Log.Requests;

namespace Settlement.Log;

public class LogAutoMapper : Profile
{
    public LogAutoMapper()
    {
        CreateMap<LogRequest, GetSettlementLogCriteria>();
    }
}