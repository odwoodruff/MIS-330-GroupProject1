using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TrainerClassesController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public TrainerClassesController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // GET: api/trainerclasses/trainer/5
    [HttpGet("trainer/{trainerId}")]
    public async Task<ActionResult<IEnumerable<Class>>> GetTrainerClasses(int trainerId)
    {
        return await _context.Classes
            .Include(s => s.Trainer)
                .ThenInclude(t => t.Employee)
            .Include(s => s.Bookings)
                .ThenInclude(b => b.Pet)
                    .ThenInclude(p => p.Customer)
            .Where(s => s.EmployeeId == trainerId)
            .ToListAsync();
    }

    // GET: api/trainerclasses/trainer/5/bookings
    [HttpGet("trainer/{trainerId}/bookings")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetTrainerBookings(int trainerId)
    {
        return await _context.Bookings
            .Include(b => b.Pet)
                .ThenInclude(p => p.Customer)
            .Include(b => b.Class)
                .ThenInclude(s => s.Trainer)
                    .ThenInclude(t => t.Employee)
            .Where(b => b.Class.EmployeeId == trainerId)
            .OrderByDescending(b => b.BookingDate)
            .ToListAsync();
    }

    // GET: api/trainerclasses/trainer/5/bookings/upcoming
    [HttpGet("trainer/{trainerId}/bookings/upcoming")]
    public async Task<ActionResult<IEnumerable<Booking>>> GetUpcomingBookings(int trainerId)
    {
        return await _context.Bookings
            .Include(b => b.Pet)
                .ThenInclude(p => p.Customer)
            .Include(b => b.Class)
                .ThenInclude(s => s.Trainer)
                    .ThenInclude(t => t.Employee)
            .Where(b => b.Class.EmployeeId == trainerId && 
                       b.Class.Date >= DateTime.Now.Date && 
                       b.Status != "Cancelled")
            .OrderBy(b => b.Class.Date)
            .ThenBy(b => b.Class.StartTime)
            .ToListAsync();
    }

    // PUT: api/trainerclasses/booking/5/status
    [HttpPut("booking/{bookingId}/status")]
    public async Task<IActionResult> UpdateBookingStatus(int bookingId, [FromBody] UpdateStatusRequest request)
    {
        var booking = await _context.Bookings.FindAsync(bookingId);
        if (booking == null)
        {
            return NotFound();
        }

        booking.Status = request.Status;
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking status updated successfully" });
    }
}

public class UpdateStatusRequest
{
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

