namespace Settlement.ThirdPartyProducts.Models
{
    public class SelectionDetailModel
    {
        public int SelectionType { get; set; }

        public string SelectionName { get; set; }

        public string TicketStatus { get; set; }

        public string Result { get; set; }

        public bool IsDifferentResult { get; set; }

        public int ResultStatusId { get; set; }
    }
}