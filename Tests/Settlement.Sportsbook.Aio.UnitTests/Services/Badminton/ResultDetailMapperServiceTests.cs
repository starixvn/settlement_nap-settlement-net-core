using Newtonsoft.Json;
using Settlement.Sportsbook.Aio.MapperFactory;
using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Badminton;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Badminton
{
    public class ResultDetailMapperServiceTests
    {
        private readonly IMapperService service;

        public ResultDetailMapperServiceTests()
        {
            service = new ResultDetailMapperServiceImp();
        }

        [Fact]
        public void Decorate_Always_GetBetTypeNameForResourceEarly()
        {
            var listResultDetail = new List<ResultDetail>
            {
                new ResultDetail { ResourceId = "7120103"},
                new ResultDetail { ResourceId = "7130307"},
                new ResultDetail { ResourceId = "0101"}
            };

            service.Decorate(listResultDetail);

            var expected = new List<ResultDetail>
            {
                new ResultDetail { ResourceId = "7120103", BetType = "712", Map = 1, BetTypeName = "Game 1 Race to 3 Points"},
                new ResultDetail { ResourceId = "7130307", BetType = "713", Map = 3, BetTypeName = "Game 3 Point 7 Winner"},
                new ResultDetail { ResourceId = "0101"}
            };

            Assert.Equal(JsonConvert.SerializeObject(expected), JsonConvert.SerializeObject(listResultDetail));
        }
    }
}