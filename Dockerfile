ARG CI_REGISTRY_IMAGE
FROM $CI_REGISTRY_IMAGE:builder as deps
RUN mkdir -p /src/packages

FROM hub.nexdev.net/base/dotnet/core/sdk:9.0-alpine AS builder

ENV NUGET_PACKAGES=/src/packages
COPY --from=deps $NUGET_PACKAGES/. $NUGET_PACKAGES/

WORKDIR /src
COPY ./Sources/Settlement.Core/*.csproj ./Sources/Settlement.Core/
COPY ./Sources/Settlement.ResourceInfos/*.csproj ./Sources/Settlement.ResourceInfos/
COPY ./Sources/Settlement.EventManagement/*.csproj ./Sources/Settlement.EventManagement/
COPY ./Sources/Settlement.FastMarkets/*.csproj ./Sources/Settlement.FastMarkets/
COPY ./Sources/Settlement.Log/*.csproj ./Sources/Settlement.Log/
COPY ./Sources/Settlement.Sportsbook.Aio/*.csproj ./Sources/Settlement.Sportsbook.Aio/
COPY ./Sources/Settlement.Sportsbook.MoveTickets/*.csproj ./Sources/Settlement.Sportsbook.MoveTickets/
COPY ./Sources/Settlement.Sportsbook.OtherSports/*.csproj ./Sources/Settlement.Sportsbook.OtherSports/
COPY ./Sources/Settlement.Sportsbook.Soccer/*.csproj ./Sources/Settlement.Sportsbook.Soccer/
COPY ./Sources/Settlement.Gaming/*.csproj ./Sources/Settlement.Gaming/
COPY ./Sources/Settlement.ThirdPartyProducts/*.csproj ./Sources/Settlement.ThirdPartyProducts/
COPY ./Sources/Settlement.Setting/*.csproj ./Sources/Settlement.Setting/
COPY ./Sources/Settlement.Outright/*.csproj ./Sources/Settlement.Outright/
COPY ./Sources/Fanex.Settlement.ScaleOut/*.csproj ./Sources/Fanex.Settlement.ScaleOut/
COPY ./WebSite/Settlement.WebSites.csproj  ./WebSite/

RUN dotnet nuget add source https://nuget.nexdev.net/api/v2
RUN dotnet restore -v n -r linux-x64  WebSite/Settlement.WebSites.csproj 

COPY ./Sources/. ./Sources
COPY ./WebSite/. ./WebSite

RUN ls /src -l
WORKDIR /src/WebSite
RUN dotnet publish -r linux-x64 --self-contained false -o /app

FROM hub.nexdev.net/base/dotnet/core/aspnet:9.0-alpine AS base

WORKDIR /app
COPY --from=builder /app .

ENV TZ="America/La_Paz"
ENV COMPlus_EnableDiagnostics=0

# Don t run as root
RUN adduser --disabled-password \
  --home /app \
  --gecos '' dotnetuser && chown -R dotnetuser /app && chown -R dotnetuser /tmp
USER dotnetuser
#

ENTRYPOINT ["dotnet", "Settlement.WebSites.dll"]
