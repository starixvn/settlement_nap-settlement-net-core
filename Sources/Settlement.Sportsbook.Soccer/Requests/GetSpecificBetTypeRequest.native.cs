using MediatR;
using System.Collections.Generic;

namespace Settlement.Sportsbook.Soccer.Requests
{
    public class GetSpecificBetTypeRequest : IRequest<List<string>>
    {
        public string Type { get; set; }

        public string Action { get; set; }
    }
}