namespace MIS330_GroupProject1.Models;

public class Booking
{
    public int Id { get; set; }
    public DateTime BookingDate { get; set; }
    public DateTime SessionDateTime { get; set; }
    public string Status { get; set; } = "Pending"; // Pending, Confirmed, Completed, Cancelled
    public string Notes { get; set; } = string.Empty;
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public int PetId { get; set; }
    public Pet Pet { get; set; } = null!;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
}

