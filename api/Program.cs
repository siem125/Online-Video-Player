using System.Runtime.InteropServices;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);

// 🌐 Select config file based on OS
var platformConfig = RuntimeInformation.IsOSPlatform(OSPlatform.Windows)
    ? "mediaStorageSettings.windows.json"
    : "mediaStorageSettings.linux.json";

// ✅ Add your custom config file
builder.Configuration.AddJsonFile(platformConfig, optional: false, reloadOnChange: true);

// ✅ Bind config section to a POCO class
builder.Services.Configure<MediaStorageSettings>(builder.Configuration.GetSection("MediaStorageSettings"));

//setting a limit for uploading size
builder.Services.Configure<KestrelServerOptions>(options =>
{
    options.Limits.MaxRequestBodySize = null; // No limit (or set in bytes if you want a hard cap)
});

builder.Services.Configure<IISServerOptions>(options =>
{
    options.MaxRequestBodySize = null; // No limit
});

builder.Services.Configure<FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = long.MaxValue; // or set a specific limit like 5_000_000_000L for 5GB
});

//setting port
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.ListenAnyIP(5130); // listens on http://*:5005
});

// Voeg CORS services toe
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("https://app.example.com") // Vervang dit door je frontend URL
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
    
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// ✅ Add MVC Controller support
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 🔧 Swagger setup
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

// ✅ Routing + Controllers
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers(); // This line enables your [ApiController] endpoints

app.Run();