using MessagePack;
using Settlement.Core.Models;
using System.Collections.Generic;

namespace Settlement.EventManagement.Models
{
    [MessagePackObject]
    public class MultiSportModel
    {
        [Key("permission")]
        public Permission Permission { get; set; }

        [Key("sports")]
        public List<SportModel> Sports { get; set; }
    }
}