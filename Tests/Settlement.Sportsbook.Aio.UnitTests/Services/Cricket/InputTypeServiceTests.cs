using Settlement.Sportsbook.Aio.Models;
using Settlement.Sportsbook.Aio.Services.Cricket;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Settlement.Sportsbook.Aio.UnitTests.Services.Cricket
{
    public class InputTypeServiceTests
    {
        private readonly IInputTypeService service;

        public InputTypeServiceTests()
        {
            service = new InputTypeServiceImp();
        }

        [Theory]
        [InlineData(9400, 0)]
        [InlineData(9446, 3)]
        [InlineData(9453, 2)]
        public void GetNonInnsBetTypeInputType_Always_ReturnCorrectInputType(int betTypeId, int inputType)
        {
            var actual = service.GetNonInnsBetTypeInputType(betTypeId);

            Assert.Equal(inputType, actual);
        }

        [Theory]
        [InlineData(9680, 9)]
        [InlineData(9662, 5)]
        [InlineData(9671, 6)]
        [InlineData(9451, 3)]
        [InlineData(9709, 2)]
        [InlineData(9435, 1)]
        [InlineData(9490, 4)]
        [InlineData(9637, 7)]
        [InlineData(9624, 8)]
        public void GetInnsBetTypeInputType_Always_ReturnCorrectInputType(int betTypeId, int inputType)
        {
            var actual = service.GetInnsBetTypeInputType(betTypeId);

            Assert.Equal(inputType, actual);
        }

        [Theory]
        [InlineData("96801001", 9680, "Test1")]
        [InlineData("96622001", 9662, "Test2")]
        public void GetInnsInputLabel_Always_ReturnCorrectInputLabel(string resourceId, int betTypeId, string inputLabel)
        {
            var inputOptions = GenerateInputData();
            var actual = service.GetInnsInputLabel(resourceId, betTypeId, inputOptions.ToList());

            Assert.Equal(inputLabel, actual.HomeValue);
        }

        [Theory]
        [InlineData("96801001", 9680, 1)]
        [InlineData("96622001", 9662, 2)]
        public void GetInputOptions_Always_GetCorrectNumberOfOptions(string resourceId, int betTypeId, int count)
        {
            var inputOptions = GenerateInputData();
            var actual = service.GetInputOptions(betTypeId, resourceId, inputOptions.ToList());

            Assert.Equal(count, actual.Count);
        }

        private static IEnumerable<InputOption> GenerateInputData()
        {
            var data = new List<InputOption>
            {
                new InputOption { ResourceId = "96801001", OddsInfo = "10001,Test1", OptionName = "Test1"},
                new InputOption { ResourceId = "96622001", OddsInfo = "10002,Test2", OptionName = "Test2"},
                new InputOption { ResourceId = "96622001", OddsInfo = "10003,Test3", OptionName = "Test3"},
            };

            return data;
        }
    }
}