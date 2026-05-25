using System;
using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using RetailOrdering.Application.Common.Behaviours;
using RetailOrdering.Application.Common.Mappings;
using RetailOrdering.Application.Features.Orders.Commands;
using RetailOrdering.Application.Features.Products.Queries;
using RetailOrdering.Application.Interfaces;
using RetailOrdering.Infrastructure.Persistence;
using RetailOrdering.Infrastructure.Services;
using RetailOrdering.WebAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// 1. Configure SQLite AppDbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=retail_ordering.db";
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString, b => b.MigrationsAssembly("RetailOrdering.Infrastructure")));
builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());

// 2. Add Domain/Infrastructure Services Dependency Injections
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IInventoryService, InventoryService>();
builder.Services.AddScoped<IEmailService, EmailService>();

// 3. Register MediatR & Pipeline Behaviours
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(GetProductsQuery).Assembly);
    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));
});

// 4. Register FluentValidation
builder.Services.AddValidatorsFromAssembly(typeof(PlaceOrderCommandValidator).Assembly);

// 5. Register AutoMapper
builder.Services.AddAutoMapper(cfg => cfg.AddProfile<MappingProfile>());

// 6. JWT Authentication Setup
var keyString = builder.Configuration["Jwt:Key"] ?? "SUPER_SECRET_PIZZA_ORDERING_KEY_2026_DO_NOT_SHARE";
if (keyString.Length < 32)
{
    keyString = keyString.PadRight(32, '0');
}
var key = Encoding.UTF8.GetBytes(keyString);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "PizzaOrderingAPI",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "PizzaOrderingWeb",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero,
        NameClaimType = "name",
        RoleClaimType = "role"
    };
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            Console.WriteLine($"Authentication failed: {context.Exception.Message}");
            if (context.Exception.InnerException != null)
            {
                Console.WriteLine($"Inner Exception: {context.Exception.InnerException.Message}");
            }
            return Task.CompletedTask;
        },
        OnTokenValidated = context =>
        {
            Console.WriteLine("Token validated successfully!");
            return Task.CompletedTask;
        }
    };
});

// 7. Authorization Policies
builder.Services.AddAuthorization();

// 8. Configure CORS (Permissive for local Angular dev port 4200)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 9. Configure Rate Limiting Middleware
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // Specific Checkout Token-Bucket policy: max 5 checkouts per 10s
    options.AddPolicy("CheckoutPolicy", httpContext =>
        RateLimitPartition.GetTokenBucketLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "anonymous",
            factory: partition => new TokenBucketRateLimiterOptions
            {
                TokenLimit = 5,
                QueueLimit = 0,
                ReplenishmentPeriod = TimeSpan.FromSeconds(10),
                TokensPerPeriod = 1,
                AutoReplenishment = true
            }));
});

// 10. Native .NET 10 OpenAPI Support
builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// 11. Database Creation & Seeding on Startup
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    DbSeeder.Seed(context);
}

// 12. Pipeline Middlewares Configuration
app.UseMiddleware<ExceptionHandlingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.WithTitle("Slice & Sip - Premium API Console")
               .WithTheme(ScalarTheme.DeepSpace)
               .WithDefaultHttpClient(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseHttpsRedirection();

// Enable CORS
app.UseCors("AllowAngularDev");

app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
