FROM hub.nexdev.net/base/dotnet/core/sdk:7.0-alpine AS builder
WORKDIR /src

COPY ./.sonarlint/. ./.sonarlint
COPY ./Sources/Settlement.Core/. ./Sources/Settlement.Core
COPY ./Sources/Settlement.ResourceInfos/. ./Sources/Settlement.ResourceInfos
COPY ./Sources/Settlement.EventManagement/. ./Sources/Settlement.EventManagement
COPY ./Sources/Settlement.FastMarkets/. ./Sources/Settlement.FastMarkets
COPY ./Sources/Settlement.Log/. ./Sources/Settlement.Log
COPY ./Sources/Settlement.Sportsbook.Aio/. ./Sources/Settlement.Sportsbook.Aio
COPY ./Sources/Settlement.Sportsbook.MoveTickets/. ./Sources/Settlement.Sportsbook.MoveTickets
COPY ./Sources/Settlement.Sportsbook.OtherSports/. ./Sources/Settlement.Sportsbook.OtherSports
COPY ./Sources/Settlement.Sportsbook.Soccer/. ./Sources/Settlement.Sportsbook.Soccer
COPY ./Sources/Settlement.Gaming/. ./Sources/Settlement.Gaming
COPY ./Sources/Settlement.ThirdPartyProducts/. ./Sources/Settlement.ThirdPartyProducts
COPY ./Sources/Settlement.Setting/. ./Sources/Settlement.Setting
COPY ./Sources/Settlement.Outright/. ./Sources/Settlement.Outright
COPY ./WebSite/Settlement.WebSites.csproj ./WebSite/Settlement.WebSites.csproj

RUN ls /src -l
WORKDIR /src/WebSite
RUN dotnet nuget add source http://nuget.nexdev.net/api/v2
RUN dotnet restore -v diag

COPY ./WebSite .

RUN dotnet publish -r linux-x64 --self-contained false -c Release -o /app

FROM hub.nexdev.net/base/dotnet/core/aspnet:7.0-alpine AS base

WORKDIR /app
COPY --from=builder /app .

ENV TZ="America/La_Paz"
ENTRYPOINT ["dotnet", "Settlement.WebSites.dll"]
