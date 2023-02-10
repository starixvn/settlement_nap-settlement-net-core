using MediatR;
using Settlement.Core.Models;
using Settlement.Setting.Models;

namespace Settlement.Setting.Requests;

public class UpdateProviderRequest : IRequest<Result>
{
    public int GameType { get; set; }

    public List<ProviderModel> Providers { get; set; }
}