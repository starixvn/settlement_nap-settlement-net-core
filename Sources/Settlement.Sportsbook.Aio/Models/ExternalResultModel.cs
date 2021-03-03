using System.Collections.Generic;

namespace Settlement.Sportsbook.Aio.Models
{
    public class ExternalResultModel
    {
        public int SourceId { get; set; }

        public string SourceName { get; set; }

        public int OrderNo { get; set; }

        public string Remark { get; set; }

        public List<ExternalResultDetailModel> ResultDetails { get; set; }
    }
}
