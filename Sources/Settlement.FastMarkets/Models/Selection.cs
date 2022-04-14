using System.Collections.Generic;

namespace Settlement.FastMarkets.Models
{
    public class Selection
    {
        private bool isChecked = true;

        public string Id => Value;

        public string Value { get; set; }

        public string Text { get; set; }

        public bool Checked
        {
            get
            {
                return !Text.Equals("No Ticket") && isChecked;
            }
            set
            {
                isChecked = value;
            }
        }

        public bool Enable { get; set; } = true;

        public List<Selection> Items { get; set; }
    }
}