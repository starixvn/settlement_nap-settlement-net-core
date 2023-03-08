namespace Settlement.Setting.Requests.OutsideSourceManager;

using MediatR;
using Settlement.Core.Models;
using Settlement.Setting.Models.OutsideSourceManager;

public class UpdateOutsideSourceRequest : IRequest<Result>
{
    public int SourceId { get; set; }

    public string SourceName { get; set; }

    public string Remark { get; set; }

    public bool SourceStatus { get; set; }

    public List<GameModel> Games { get; set; }

    public int SportType { get; set; }
}