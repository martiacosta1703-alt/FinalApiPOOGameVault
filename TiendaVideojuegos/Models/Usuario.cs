namespace TiendaVideojuegos.Models
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Nombre { get; set; } = string.Empty;
        public string Correo { get; set; } = string.Empty;
        public string Rol { get; set; } = string.Empty; // "Administrador", "Vendedor", "Cliente"
        public string KeyAcceso { get; set; } = string.Empty;
    }
}