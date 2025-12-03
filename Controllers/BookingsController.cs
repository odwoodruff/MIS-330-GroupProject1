using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MIS330_GroupProject1.Data;
using MIS330_GroupProject1.Models;

namespace MIS330_GroupProject1.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly PetTrainingDbContext _context;

    public BookingsController(PetTrainingDbContext context)
    {
        _context = context;
    }

    // GET: api/bookings?customerId=1&status=Pending&sortBy=date&sortOrder=desc
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetBookings(
        [FromQuery] int? customerId,
        [FromQuery] string? status,
        [FromQuery] string? sortBy,
        [FromQuery] string? sortOrder,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Class)
                .ThenInclude(s => s.Trainer)
            .AsQueryable();

        // Filter by customer
        if (customerId.HasValue)
        {
            query = query.Where(b => b.CustomerId == customerId.Value);
        }

        // Filter by status
        if (!string.IsNullOrEmpty(status))
        {
            query = query.Where(b => b.Status == status);
        }

        // Filter by date range
        if (startDate.HasValue)
        {
            query = query.Where(b => b.SessionDateTime >= startDate.Value);
        }
        if (endDate.HasValue)
        {
            query = query.Where(b => b.SessionDateTime <= endDate.Value);
        }

        // Sorting
        sortBy = sortBy?.ToLower() ?? "date";
        sortOrder = sortOrder?.ToLower() ?? "desc";

        query = sortBy switch
        {
            "date" => sortOrder == "desc" ? query.OrderByDescending(b => b.SessionDateTime) : query.OrderBy(b => b.SessionDateTime),
            "status" => sortOrder == "desc" ? query.OrderByDescending(b => b.Status) : query.OrderBy(b => b.Status),
            "price" => sortOrder == "desc" ? query.OrderByDescending(b => b.Class.Price) : query.OrderBy(b => b.Class.Price),
            _ => query.OrderByDescending(b => b.SessionDateTime)
        };

        return await query.ToListAsync();
    }

    // GET: api/bookings/5
    [HttpGet("{id}")]
    public async Task<ActionResult<Booking>> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.Customer)
            .Include(b => b.Pet)
            .Include(b => b.Class)
                .ThenInclude(s => s.Trainer)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return NotFound();
        }

        return booking;
    }

    // POST: api/bookings
    [HttpPost]
    public async Task<ActionResult<Booking>> CreateBooking(Booking booking)
    {
        booking.BookingDate = DateTime.Now;
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, booking);
    }

    // PUT: api/bookings/5
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBooking(int id, Booking booking)
    {
        if (id != booking.Id)
        {
            return BadRequest();
        }

        _context.Entry(booking).State = EntityState.Modified;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!BookingExists(id))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }

    // DELETE: api/bookings/5
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound();
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // PUT: api/bookings/5/cancel
    [HttpPut("{id}/cancel")]
    public async Task<IActionResult> CancelBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound();
        }

        booking.Status = "Cancelled";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking cancelled successfully" });
    }

    // PUT: api/bookings/5/confirm
    [HttpPut("{id}/confirm")]
    public async Task<IActionResult> ConfirmBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return NotFound();
        }

        booking.Status = "Confirmed";
        await _context.SaveChangesAsync();

        return Ok(new { message = "Booking confirmed successfully" });
    }

    private bool BookingExists(int id)
    {
        return _context.Bookings.Any(e => e.Id == id);
    }
}

