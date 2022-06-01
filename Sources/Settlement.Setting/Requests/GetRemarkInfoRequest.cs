using MediatR;
using Settlement.Setting.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Settlement.Setting.Requests
{
    public class GetRemarkInfoRequest : IRequest<MatchAndPermission>
    {
        public int MatchId { get; set; }
    }
}