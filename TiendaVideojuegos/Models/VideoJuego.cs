namespace TiendaVideojuegos.Models
{
    public class Videojuego : Producto
    {
        public string Genero { get; set; } = string.Empty;
        public string Plataforma { get; set; } = string.Empty;

        public override string Categoria => "Videojuego";
    }
}
