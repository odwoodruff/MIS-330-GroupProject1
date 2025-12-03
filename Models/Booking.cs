namespace MIS330_GroupProject1.Models;

public class Booking
{
    public int BookingId { get; set; }
    public DateTime BookingDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string PaymentMethod { get; set; } = string.Empty;
    public int PetId { get; set; }
    public Pet Pet { get; set; } = null!;
    public int ClassId { get; set; }
    public Class Class { get; set; } = null!;
}
