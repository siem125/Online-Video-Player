# 🛠️ Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .

#commands
RUN dotnet restore
RUN dotnet publish -c Release -o /app --no-restore

# 🚀 Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

#set port but should be changed by the main .env(in root folder)
EXPOSE 5000

ENTRYPOINT ["dotnet", "api.dll"]
