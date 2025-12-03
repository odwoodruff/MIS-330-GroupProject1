# MySQL Database Setup Guide

This guide will help you connect your MySQL database to the Pet Training Booking System.

## Prerequisites

1. **MySQL Server** installed and running

   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use MySQL via XAMPP, WAMP, or Docker

2. **MySQL Workbench** (optional but recommended)
   - Download from: https://dev.mysql.com/downloads/workbench/

## Step 1: Create MySQL Database

1. Open MySQL Command Line Client or MySQL Workbench
2. Connect to your MySQL server
3. Create a new database:

```sql
CREATE DATABASE PetTrainingDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Or using MySQL Workbench:

- Right-click in the Schemas panel
- Select "Create Schema"
- Name it `PetTrainingDB`
- Set Character Set to `utf8mb4`
- Set Collation to `utf8mb4_unicode_ci`
- Click "Apply"

## Step 2: Create MySQL User (Optional but Recommended)

For better security, create a dedicated user:

```sql
CREATE USER 'pettraining_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON PetTrainingDB.* TO 'pettraining_user'@'localhost';
FLUSH PRIVILEGES;
```

## Step 3: Update Connection String

1. Open `appsettings.json` in the project root
2. Update the connection string with your MySQL credentials:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=PetTrainingDB;User=root;Password=yourpassword;Port=3306;"
  }
}
```

### Connection String Parameters:

- **Server**: Your MySQL server address (usually `localhost` or `127.0.0.1`)
- **Database**: The database name you created (`PetTrainingDB`)
- **User**: Your MySQL username (default is `root`)
- **Password**: Your MySQL password
- **Port**: MySQL port (default is `3306`)

### Example Connection Strings:

**Using root user:**

```
Server=localhost;Database=PetTrainingDB;User=root;Password=mypassword;Port=3306;
```

**Using dedicated user:**

```
Server=localhost;Database=PetTrainingDB;User=pettraining_user;Password=securepass;Port=3306;
```

**For remote MySQL server:**

```
Server=192.168.1.100;Database=PetTrainingDB;User=myuser;Password=mypass;Port=3306;
```

**With SSL (for production):**

```
Server=localhost;Database=PetTrainingDB;User=root;Password=mypassword;Port=3306;SslMode=Required;
```

## Step 4: Update Development Settings

Also update `appsettings.Development.json` with the same connection string for development environment.

## Step 5: Test the Connection

1. Restore packages:

   ```bash
   dotnet restore
   ```

2. Build the project:

   ```bash
   dotnet build
   ```

3. Run the application:

   ```bash
   dotnet run
   ```

4. The application will automatically create the database tables on first run using `EnsureCreated()`.

## Troubleshooting

### Common Issues:

1. **"Connection string not found" error**

   - Make sure `appsettings.json` exists in the project root
   - Verify the connection string key is `DefaultConnection`

2. **"Access denied for user" error**

   - Check your MySQL username and password
   - Verify the user has privileges on the database
   - Try connecting with MySQL Workbench first to test credentials

3. **"Unknown database" error**

   - Make sure the database exists
   - Check the database name in the connection string matches the created database

4. **"Can't connect to MySQL server" error**

   - Verify MySQL server is running
   - Check the server address and port
   - For remote servers, ensure firewall allows connections

5. **Port issues**
   - Default MySQL port is 3306
   - If using a different port, update it in the connection string

### Testing Connection Manually:

You can test your connection string using MySQL Command Line:

```bash
mysql -u root -p -h localhost -P 3306
```

Or in MySQL Workbench, try creating a new connection with the same parameters.

## Using Entity Framework Migrations (Recommended for Production)

For better database management, consider using EF Core Migrations instead of `EnsureCreated()`:

1. Install EF Core Tools (if not already installed):

   ```bash
   dotnet tool install --global dotnet-ef
   ```

2. Create initial migration:

   ```bash
   dotnet ef migrations add InitialCreate
   ```

3. Apply migration to database:

   ```bash
   dotnet ef database update
   ```

4. Update `Program.cs` to use migrations:
   ```csharp
   // Replace EnsureCreated() with:
   context.Database.Migrate();
   ```

## Security Best Practices

1. **Never commit passwords to version control**

   - Use User Secrets for development:
     ```bash
     dotnet user-secrets set "ConnectionStrings:DefaultConnection" "your-connection-string"
     ```
   - Use environment variables or Azure Key Vault for production

2. **Use dedicated database user** with limited privileges
3. **Enable SSL** for production connections
4. **Use strong passwords**
5. **Restrict database access** to necessary IP addresses

## Environment Variables (Alternative)

You can also set the connection string via environment variable:

**Windows:**

```cmd
set ConnectionStrings__DefaultConnection="Server=localhost;Database=PetTrainingDB;User=root;Password=mypass;Port=3306;"
```

**Linux/Mac:**

```bash
export ConnectionStrings__DefaultConnection="Server=localhost;Database=PetTrainingDB;User=root;Password=mypass;Port=3306;"
```

## Next Steps

Once connected:

1. Run the application
2. The database tables will be created automatically
3. Seed data (trainers and sessions) will be added
4. Start using the application!

For any issues, check the application logs for detailed error messages.
