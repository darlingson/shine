# syntax=docker/dockerfile:1

# ---------- Build stage ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy just the project file first so NuGet restore stays cached
# unless dependencies change.
COPY ["ShineApi/ShineApi.csproj", "ShineApi/"]
RUN dotnet restore "ShineApi/ShineApi.csproj"

# Copy everything else and publish a Release build.
COPY . .
WORKDIR /src/ShineApi
RUN dotnet publish "ShineApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# ---------- Runtime stage ----------
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

# Render injects $PORT (default 10000) and expects the service to listen
# on it for HTTP traffic. TLS terminates at Render's proxy, so the app
# itself serves plain HTTP (see forwarded-headers setup in Program.cs).
EXPOSE 10000
COPY --from=build /app/publish .

ENTRYPOINT ["sh", "-c", "ASPNETCORE_URLS=http://+:${PORT:-10000} exec dotnet ShineApi.dll"]
