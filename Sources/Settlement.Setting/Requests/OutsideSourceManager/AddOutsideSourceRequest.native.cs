namespace Settlement.Setting.Requests.OutsideSourceManager;

using MediatR;
using Settlement.Setting.Models.OutsideSourceManager;

public class AddOutsideSourceRequest : IRequest<AddSourceResult>
{
    public string SourceName { get; set; }

    public string Remark { get; set; }

    public List<GameModel> Games { get; set; }

    public int SportType { get; set; }
}