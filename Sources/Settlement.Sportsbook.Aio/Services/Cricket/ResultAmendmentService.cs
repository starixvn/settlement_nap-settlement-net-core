using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Settlement.Sportsbook.Aio.Criteria.Cricket;
using Settlement.Sportsbook.Aio.Models;

namespace Settlement.Sportsbook.Aio.Services.Cricket;

public class ResultAmendmentService
{
    private readonly IDynamicRepository _repository;

    public ResultAmendmentService(IDynamicRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ResultChanged>> CheckReSettleTicket()
    {
        var criteria = new CheckReSettleCriteria();
        var results = await _repository.FetchAsync<ResultChanged>(criteria);

        return new List<ResultChanged>();
    }

    public async Task CreateResultHistory()
    {
    }
}