namespace MIS330_GroupProject1.Models;

public class Pet
{
    public int PetId { get; set; }
    public string PetFullName { get; set; } = string.Empty;
    public string Species { get; set; } = string.Empty;
    public string Breed { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime BirthDate { get; set; }
    public int CustomerId { get; set; }
    public Customer Customer { get; set; } = null!;
    public List<Booking> Bookings { get; set; } = new();
}
