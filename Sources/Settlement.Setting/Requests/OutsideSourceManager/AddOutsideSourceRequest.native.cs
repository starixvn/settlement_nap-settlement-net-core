using MediatR;
using Settlement.Setting.Models.OutsideSourceManager;
using System.Collections.Generic;

namespace Settlement.Setting.Requests
{
    public class AddOutsideSourceRequest : IRequest<AddSourceResult>
    {
        public string SourceName { get; set; }

        public string Remark { get; set; }

        public List<GameModel> Games { get; set; }

        public int SportType { get; set; }
    }
}