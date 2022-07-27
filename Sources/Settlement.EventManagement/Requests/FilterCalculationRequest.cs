using System;
using MediatR;
using Settlement.EventManagement.Models.Calculation;

namespace Settlement.EventManagement
{
    public class FilterCalculationRequest : IRequest<CalculationLeagues>
    {
        public DateTime FromDate { get; set; }

        public DateTime ToDate { get; set; }

        public string MatchCode { get; set; }

        public int SportType { get; set; }

        public int LeagueId { get; set; }

        public bool IsIncludeTest { get; set; }

        public byte StatusId { get; set; }

        public byte FilterBy
        {
            get
            {
                const int noneFilter = 0;
                const int unCalculateFilter = 1;
                const int unCalculateMultipleFilter = 2;
                const int allFilter = 3;

                if (UnCalculate && UnCalculateMultiple)
                {
                    return allFilter;
                }
                else if (UnCalculateMultiple)
                {
                    return unCalculateMultipleFilter;
                }
                else if (UnCalculate)
                {
                    return unCalculateFilter;
                }
                else
                {
                    return noneFilter;
                }
            }
        }

        public bool UnCalculate { get; set; }

        public bool UnCalculateMultiple { get; set; }

        public bool AutoSettlementOnly { get; set; }

        public bool FastMarketsOnly { get; set; }

        public bool IsMarkedTicket { get; set; }
    }
}