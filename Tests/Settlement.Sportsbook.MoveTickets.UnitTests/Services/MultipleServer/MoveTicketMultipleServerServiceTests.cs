using AutoMapper;
using AutoMapper.Configuration;
using Fanex.Data.Repository;
using Fanex.NAP.Client.Helpers.Web;
using Fanex.Settlement.ScaleOut.Models;
using Fanex.Settlement.ScaleOut.Request;
using Fanex.Settlement.ScaleOut.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Settlement.Core.Models;
using Settlement.Core.Services;
using Settlement.Sportsbook.MoveTickets.Criteria;
using Settlement.Sportsbook.MoveTickets.Models;
using Settlement.Sportsbook.MoveTickets.Requests;

namespace Settlement.Sportsbook.MoveTickets.UnitTests.Services.MultipleServer
{
    public class MoveTicketMultipleServerServiceTests
    {
        private readonly IDynamicRepository repository;
        private readonly IMapper mapper;
        private readonly INapSession currentSession;
        private readonly IHttpContextAccessor accessor;
        private readonly ILogService logService;
        private readonly ScaleOutSettleService scaleOutSettleService;
        private readonly MoveTicketMultipleServerService service;

        public MoveTicketMultipleServerServiceTests()
        {
            repository = Substitute.For<IDynamicRepository>();
            currentSession = Substitute.For<INapSession>();
            var mapperConfig = new MapperConfigurationExpression();
            mapperConfig.AddProfile<SportsbookMoveTicketAutoMapperProfile>();
            var config = new MapperConfiguration(mapperConfig);
            mapper = new Mapper(config);
            logService = Substitute.For<ILogService>();
            scaleOutSettleService = Substitute.For<ScaleOutSettleService>();
            accessor = Substitute.For<IHttpContextAccessor>();
            var context = new DefaultHttpContext();
            context.Connection.RemoteIpAddress = new System.Net.IPAddress(1);
            accessor.HttpContext = context;
            var appSettings = new AppSettingsKey { SiteDbServer = new List<string> { "01", "02" } };
            var options = Options.Create(appSettings);
            service = new MoveTicketMultipleServerServiceImp(repository, mapper, currentSession, accessor, logService,
                options, scaleOutSettleService);
        }

        [Fact]
        public async Task MoveTicket_ValidateFailed_StopProcessAndWriteLog()
        {
            var failedResult = new ResultMessage
            {
                ErrorCode = 1,
                ErrorMessage = "Error"
            };

            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(failedResult);

            var result = await service.MoveTicket(new MoveTicketRequest { MatchId = 100 });

            logService.Received().ActionLog(100, "Error", Arg.Any<int>());
            Assert.Equal("Error", result.ErrMsg);
            await repository.DidNotReceive().ExecuteAsync(Arg.Any<MoveTicketCriteria>());
        }

        [Fact]
        public async Task MoveTicket_ValidatePassed_ExecuteAll()
        {
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());
            repository.GetAsync<MoveTicketInfo>(Arg.Any<GetMoveTicketInfoCriteria>()).Returns(new MoveTicketInfo());

            var result = await service.MoveTicket(new MoveTicketRequest());

            await repository.Received(2).ExecuteAsync(Arg.Any<MoveTicketCriteria>());
            await repository.Received(1).ExecuteAsync(Arg.Any<UpdateChildMatchCriteria>());
            await repository.Received(1).ExecuteAsync(Arg.Any<UpdateChildMatchRemarkCriteria>());
            Assert.Null(result.ErrMsg);
        }

        [Fact]
        public async Task MoveRunningTickets_ValidateFailed_WriteLogAndReturn()
        {
            var failedResult = new ResultMessage
            {
                ErrorCode = 1,
                ErrorMessage = "Error"
            };

            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(failedResult);

            var result = await service.MoveRunningTickets(new MoveRunningTicketsRequest { MatchId = 100 });

            logService.Received().ActionLog(100, "Error", Arg.Any<int>());
            Assert.Equal("Error", result.ErrMsg);
            await repository.DidNotReceive().ExecuteAsync(Arg.Any<MoveRunningTicketsCriteria>());
        }

        [Fact]
        public async Task MoveRunningTickets_ValidatePassed_ExecuteAll()
        {
            scaleOutSettleService.ValidateEventAndTicket(Arg.Any<EventTicketRequest>()).Returns(new ResultMessage());

            var result = await service.MoveRunningTickets(new MoveRunningTicketsRequest());

            repository.Received(2).Execute(Arg.Any<MoveRunningTicketsCriteria>());
            repository.Received().Execute(Arg.Any<CopyResultCriteria>());
        }

        [Fact]
        public async Task ValidateMovingRunningTickets_Always_ReturnFromSP()
        {
            await repository.ExecuteAsync(Arg.Do<ValidateMatchesCriteria>(item =>
            {
                item.ErrMsg = "Error";
                item.ErrCode = 1;
            }));

            var result = await service.ValidateMovingRunningTickets(new ValidateMatchesRequest());

            Assert.Equal("Error", result.ErrMsg);
            Assert.Equal(1, result.ErrCode);
        }
    }
}