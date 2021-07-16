using AutoMapper;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Microsoft.AspNetCore.Http;
using Settlement.Core.Models;
using Settlement.Sportsbook.OtherSports.Criteria;
using Settlement.Sportsbook.OtherSports.Requests;
using System.Threading.Tasks;

namespace Settlement.Sportsbook.OtherSports.Services
{
    public interface SettlementActionsService
    {
        Task<Result> Calculate(CalculateRequest request);

        Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request);

        Task<Result> Refund(RefundRequest request);

        Task<Result> RefundParlay(RefundParlayRequest request);
    }

    public class SettlementActionsServiceImp : SettlementActionsService
    {
        private readonly IDynamicRepository repository;

        private readonly INapSession currentSession;

        private readonly IHttpContextAccessor accessor;

        private readonly IMapper mapper;

        public SettlementActionsServiceImp(
            IDynamicRepository repository,
            IHttpContextAccessor accessor,
            INapSession currentSession,
            IMapper mapper)
        {
            this.repository = repository;
            this.currentSession = currentSession;
            this.accessor = accessor;
            this.mapper = mapper;
        }

        public async Task<Result> Calculate(CalculateRequest request)
        {
            var criteria = mapper.Map<CalculateRequest, CalculateCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }

        public async Task<MarkedTickets> CheckMarkedTickets(CheckingMarkedTicketsRequest request)
        {
            var criteria = mapper.Map<CheckingMarkedTicketsRequest, CheckingMarkedTicketsCriteria>(request);
            await repository.ExecuteAsync(criteria);

            return new MarkedTickets { IsExistMarkedTicket = criteria.IsExistMarkedTicket };
        }

        public async Task<Result> Refund(RefundRequest request)
        {
            var criteria = mapper.Map<RefundRequest, RefundAllCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg,
            };
        }

        public async Task<Result> RefundParlay(RefundParlayRequest request)
        {
            var criteria = mapper.Map<RefundParlayRequest, ParlayCriteria>(request);
            criteria.AdminId = currentSession.UserId;
            criteria.Ip = accessor.HttpContext.Connection.RemoteIpAddress.ToString();
            await repository.ExecuteAsync(criteria);

            return new Result
            {
                ErrCode = criteria.ErrCode,
                ErrMsg = criteria.ErrMsg
            };
        }
    }
}