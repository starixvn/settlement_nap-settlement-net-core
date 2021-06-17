FROM registry.nexdev.net:5050/docker/dotnet/core/sdk:5.0.102-ca-patch-buster-slim AS builder
WORKDIR /src
ENV TZ="America/New_York"

COPY ./Sources/Settlement.Core ./Settlement.Core
COPY ./Sources/Settlement.Sportsbook.Aio ./Settlement.Sportsbook.Aio
COPY ./Sources/Settlement.WebSites/Settlement.WebSites.csproj ./Settlement.WebSites/Settlement.WebSites.csproj
COPY ./Sources/Settlement.Sportsbook.MoveTickets ./Settlement.Sportsbook.MoveTickets
COPY ./Sources/Settlement.Sportsbook.OtherSports ./Settlement.Sportsbook.OtherSports

RUN ls /src -l
WORKDIR /src/Settlement.WebSites
RUN dotnet nuget add source http://nuget.nexdev.net/api/v2
RUN dotnet restore -v diag

COPY ./Sources/Settlement.WebSites .

RUN dotnet publish -r linux-x64 --self-contained false -c Release -o /app

FROM registry.nexdev.net:5050/docker/dotnet/core/aspnet:5.0-buster-slim AS base

RUN sed -i 's/DEFAULT@SECLEVEL=2/DEFAULT@SECLEVEL=1/g' /etc/ssl/openssl.cnf
RUN sed -i 's/MinProtocol = TLSv1.2/MinProtocol = TLSv1/g' /etc/ssl/openssl.cnf
RUN sed -i 's/DEFAULT@SECLEVEL=2/DEFAULT@SECLEVEL=1/g' /usr/lib/ssl/openssl.cnf
RUN sed -i 's/MinProtocol = TLSv1.2/MinProtocol = TLSv1/g' /usr/lib/ssl/openssl.cnf

WORKDIR /app
COPY --from=builder /app .

ENTRYPOINT ["dotnet", "Settlement.WebSites.dll"]
