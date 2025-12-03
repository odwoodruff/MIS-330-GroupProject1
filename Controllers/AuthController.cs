using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;
using System.Security.Cryptography;
using System.Text;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public AuthController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // POST: api/auth/register
    [HttpPost("register")]
    public async Task<ActionResult<Customer>> Register(RegisterRequest request)
    {
        try
        {
            // Validate required fields
            if (string.IsNullOrWhiteSpace(request.Username) || 
                string.IsNullOrWhiteSpace(request.Email) || 
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Username, email, and password are required" });
            }

            // Check if username or email already exists
            if (await _context.Customers.AnyAsync(u => u.Username == request.Username || u.Email == request.Email))
            {
                return BadRequest(new { message = "Username or email already exists" });
            }

            var customer = new Customer
            {
                Username = request.Username,
                Email = request.Email,
                PasswordHash = HashPassword(request.Password),
                Role = request.Role ?? "Customer",
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone,
                CreatedAt = DateTime.Now
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            // Create Trainer if Trainer role
            if (customer.Role == "Trainer")
            {
                var trainer = new Trainer
                {
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    Phone = customer.Phone,
                    Specialization = request.Specialization ?? "General Training"
                };
                _context.Trainers.Add(trainer);
                await _context.SaveChangesAsync();

                customer.TrainerId = trainer.Id;
                await _context.SaveChangesAsync();
            }

            // Create Employee if Employee role
            if (customer.Role == "Employee")
            {
                var employee = new Employee
                {
                    FirstName = customer.FirstName,
                    LastName = customer.LastName,
                    Email = customer.Email,
                    Phone = customer.Phone,
                    Position = request.Specialization ?? "Staff"
                };
                _context.Employees.Add(employee);
                await _context.SaveChangesAsync();

                customer.EmployeeId = employee.Id;
                await _context.SaveChangesAsync();
            }

            return Ok(new { user = new { customer.Id, customer.Username, customer.Email, customer.Role, customer.FirstName, customer.LastName, TrainerId = customer.TrainerId, EmployeeId = customer.EmployeeId } });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Registration failed: {ex.Message}" });
        }
    }

    // POST: api/auth/login
    [HttpPost("login")]
    public async Task<ActionResult> Login(LoginRequest request)
    {
        var customer = await _context.Customers
            .Include(u => u.Trainer)
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Username == request.Username || u.Email == request.Username);

        if (customer == null || !VerifyPassword(request.Password, customer.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid username or password" });
        }

        return Ok(new
        {
            user = new
            {
                customer.Id,
                customer.Username,
                customer.Email,
                customer.Role,
                customer.FirstName,
                customer.LastName,
                customer.Phone,
                TrainerId = customer.TrainerId,
                EmployeeId = customer.EmployeeId
            }
        });
    }

    // GET: api/auth/profile/{id}
    [HttpGet("profile/{id}")]
    public async Task<ActionResult<Customer>> GetProfile(int id)
    {
        var customer = await _context.Customers
            .Include(u => u.Trainer)
            .Include(u => u.Employee)
            .FirstOrDefaultAsync(u => u.Id == id);

        if (customer == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user = new
            {
                customer.Id,
                customer.Username,
                customer.Email,
                customer.Role,
                customer.FirstName,
                customer.LastName,
                customer.Phone,
                customer.CreatedAt,
                TrainerId = customer.TrainerId,
                EmployeeId = customer.EmployeeId
            }
        });
    }

    // PUT: api/auth/profile/{id}
    [HttpPut("profile/{id}")]
    public async Task<IActionResult> UpdateProfile(int id, UpdateProfileRequest request)
    {
        var customer = await _context.Customers.FindAsync(id);
        if (customer == null)
        {
            return NotFound();
        }

        customer.FirstName = request.FirstName ?? customer.FirstName;
        customer.LastName = request.LastName ?? customer.LastName;
        customer.Email = request.Email ?? customer.Email;
        customer.Phone = request.Phone ?? customer.Phone;

        if (!string.IsNullOrEmpty(request.Password))
        {
            customer.PasswordHash = HashPassword(request.Password);
        }

        await _context.SaveChangesAsync();

        return Ok(new { message = "Profile updated successfully" });
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}

public class RegisterRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Specialization { get; set; }
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Password { get; set; }
}
