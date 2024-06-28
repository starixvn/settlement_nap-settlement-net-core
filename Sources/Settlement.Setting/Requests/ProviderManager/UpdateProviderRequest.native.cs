namespace Settlement.Setting.Requests.ProviderManager;

using MediatR;
using Models.ProviderManager;
using Settlement.Models;

public class UpdateProviderRequest : IRequest<Result>
{
    public int GameType { get; set; }

    public List<ProviderModel> Providers { get; set; }
}