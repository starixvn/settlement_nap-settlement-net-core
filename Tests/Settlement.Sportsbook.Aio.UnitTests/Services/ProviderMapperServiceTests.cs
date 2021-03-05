using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services;
using System;
using System.Collections.Generic;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services
{
    public class ProviderMapperServiceTests
    {
        private readonly ProviderMapperService service;

        public ProviderMapperServiceTests()
        {
            service = new ProviderMapperService();
        }

        [Fact]
        public void Decorate_Always_FetchCorrectResultsAndGroupThem()
        {
            var fakeList = new List<ExternalResultDetailModel>()
            {
                new ExternalResultDetailModel(),
                new ExternalResultDetailModel(),
                new ExternalResultDetailModel()
            };
            var input = new Tuple<List<ExternalResultDetailModel>, List<ExternalResultModel>>(fakeList, new List<ExternalResultModel>());

            service.Decorate(input);

            Assert.Single(input.Item2);
        }
    }
}
