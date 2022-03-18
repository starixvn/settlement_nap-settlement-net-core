using System.Collections.Generic;

namespace Settlement.FastMarkets.Models
{
    public class IntervalTime
    {
        private const int Halftime = 45;
        private const int FullTime = 90;

        public List<Selection> Value => new List<Selection>
        {
            HalfTimeSelection(),
            FullTimeSelection()
        };

        private List<Selection> HalfTimeInterval()
        {
            var firstHalf = new List<Selection>();

            for (var time = 0; time < Halftime; time++)
            {
                var text = time < 10 ? $"0{time}:00-" : $"{time}:00-";
                var selection = new Selection { Value = time.ToString(), Text = text };
                firstHalf.Add(selection);
            }

            return firstHalf;
        }

        private Selection HalfTimeSelection()
        {
            var halfTimeSelection = new Selection
            {
                Value = "1H",
                Text = "1H",
                Items = HalfTimeInterval()
            };

            return halfTimeSelection;
        }

        private List<Selection> FullTimeInterval()
        {
            var fullTime = new List<Selection>();
            for (var time = Halftime; time < FullTime; time++)
            {
                var text = $"{time}:00-";
                var selection = new Selection { Value = time.ToString(), Text = text };
                fullTime.Add(selection);
            }

            return fullTime;
        }

        private Selection FullTimeSelection()
        {
            var fullTimeSelection = new Selection
            {
                Value = "2H",
                Text = "2H",
                Items = FullTimeInterval()
            };
            return fullTimeSelection;
        }
    }
}