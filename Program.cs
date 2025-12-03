using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// Configure Entity Framework with MySQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<PetTrainingDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Configure CORS to allow frontend to access the API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5004", "http://localhost:5002", "http://localhost:5000", "http://localhost:5001")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseCors("AllowFrontend");

// Enable default files (index.html) - MUST come before UseStaticFiles
app.UseDefaultFiles();

// Serve static files from wwwroot
app.UseStaticFiles();

app.UseAuthorization();

app.MapControllers();

// Fallback to index.html for SPA routing
app.MapFallbackToFile("index.html");

// Ensure database is created and tables are created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PetTrainingDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    try
    {
        logger.LogInformation("Checking database connection and creating tables...");
        var canConnect = context.Database.CanConnect();
        if (!canConnect)
        {
            logger.LogWarning("Cannot connect to database. Please check your connection string.");
        }
        else
        {
            logger.LogInformation("Database connection successful. Creating tables...");
            try
            {
                // Force creation of tables
                var created = context.Database.EnsureCreated();
                if (created)
                {
                    logger.LogInformation("Database tables created successfully.");
                }
                else
                {
                    logger.LogInformation("Database tables already exist or could not be created.");
                }
            }
            catch (Exception dbEx)
            {
                logger.LogError(dbEx, "Error creating tables: {Message}", dbEx.Message);
                logger.LogWarning("You may need to run the create_tables.sql script manually in MySQL Workbench.");
            }
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "An error occurred while creating the database: {Message}", ex.Message);
    }
}

// Configure to use port 5004 to avoid conflicts (HTTP only)
app.Urls.Add("http://localhost:5004");

app.Run();
