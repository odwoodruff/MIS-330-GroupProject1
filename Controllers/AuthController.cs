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
            if (string.IsNullOrWhiteSpace(request.CustEmail) || 
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            // Check if email already exists
            if (await _context.Customers.AnyAsync(u => u.CustEmail == request.CustEmail))
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var customer = new Customer
            {
                CustFName = request.CustFName,
                CustLName = request.CustLName,
                CustEmail = request.CustEmail,
                CustPhoneNum = request.CustPhoneNum,
                Address = request.Address ?? string.Empty,
                Password = request.Password // Store plain password to match existing database schema
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return Ok(new { 
                user = new { 
                    customer.CustomerId, 
                    customer.CustEmail, 
                    customer.CustFName, 
                    customer.CustLName,
                    Role = "Customer"
                } 
            });
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
        // Login using custEmail and password
        var customer = await _context.Customers
            .FirstOrDefaultAsync(u => u.CustEmail == request.Username);

        if (customer == null || customer.Password != request.Password)
        {
            return Unauthorized(new { message = "Invalid email or password" });
        }

        return Ok(new
        {
            user = new
            {
                customer.CustomerId,
                customer.CustEmail,
                customer.CustFName,
                customer.CustLName,
                customer.CustPhoneNum,
                Role = "Customer"
            }
        });
    }

    // GET: api/auth/profile/{id}
    [HttpGet("profile/{id}")]
    public async Task<ActionResult<Customer>> GetProfile(int id)
    {
        var customer = await _context.Customers
            .FirstOrDefaultAsync(u => u.CustomerId == id);

        if (customer == null)
        {
            return NotFound();
        }

        return Ok(new
        {
            user = new
            {
                customer.CustomerId,
                customer.CustEmail,
                customer.CustFName,
                customer.CustLName,
                customer.CustPhoneNum,
                customer.Address,
                Role = "Customer"
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

        customer.CustFName = request.CustFName ?? customer.CustFName;
        customer.CustLName = request.CustLName ?? customer.CustLName;
        customer.CustEmail = request.CustEmail ?? customer.CustEmail;
        customer.CustPhoneNum = request.CustPhoneNum ?? customer.CustPhoneNum;
        customer.Address = request.Address ?? customer.Address;

        if (!string.IsNullOrEmpty(request.Password))
        {
            customer.Password = request.Password; // Store plain password to match database schema
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
    public string CustFName { get; set; } = string.Empty;
    public string CustLName { get; set; } = string.Empty;
    public string CustEmail { get; set; } = string.Empty;
    public string CustPhoneNum { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string Password { get; set; } = string.Empty;
}

public class LoginRequest
{
    public string Username { get; set; } = string.Empty; // This will be custEmail
    public string Password { get; set; } = string.Empty;
}

public class UpdateProfileRequest
{
    public string? CustFName { get; set; }
    public string? CustLName { get; set; }
    public string? CustEmail { get; set; }
    public string? CustPhoneNum { get; set; }
    public string? Address { get; set; }
    public string? Password { get; set; }
}
