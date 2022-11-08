using MediatR;
using Settlement.Setting.Models;
using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.Setting.Requests
{
    public class UpdateProviderRequest : IRequest<Result>
    {
        public int GameType { get; set; }

        public List<ProviderModel> Providers { get; set; }
    }
}