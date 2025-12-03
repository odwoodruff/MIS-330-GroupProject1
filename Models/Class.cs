namespace MIS330_GroupProject1.Models;

public class Class
{
    public int Id { get; set; }
    public string Type { get; set; } = string.Empty; // e.g., "Basic Obedience", "Advanced Training", "Behavioral"
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public int TrainerId { get; set; }
    public Trainer Trainer { get; set; } = null!;
    public List<Booking> Bookings { get; set; } = new();
}

