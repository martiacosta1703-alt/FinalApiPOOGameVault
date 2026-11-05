using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using TiendaVideojuegos.Models;

namespace TiendaVideojuegos.Services
{
    public class ConsolaService
    {
        private readonly string _jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "consolas.json");
        private List<Consola> _consolas = new List<Consola>();

        public ConsolaService()
        {
            CargarDesdeJson();
        }

        private void CargarDesdeJson()
        {
            if (File.Exists(_jsonFilePath))
            {
                var jsonText = File.ReadAllText(_jsonFilePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                _consolas = JsonSerializer.Deserialize<List<Consola>>(jsonText, options) ?? new List<Consola>();
            }
        }

        private void GuardarEnJson()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonText = JsonSerializer.Serialize(_consolas, options);
            File.WriteAllText(_jsonFilePath, jsonText);
        }

        public List<Consola> ObtenerTodos() => _consolas;

        public Consola? ObtenerPorId(int id) => _consolas.FirstOrDefault(c => c.Id == id);

        public void AgregarConsola(Consola consola)
        {
            consola.Id = _consolas.Count > 0 ? _consolas.Max(c => c.Id) + 1 : 1;
            _consolas.Add(consola);
            GuardarEnJson();
        }

        public bool ActualizarConsola(int id, Consola consolaActualizada)
        {
            var consola = ObtenerPorId(id);
            if (consola == null) return false;

            consola.Nombre = consolaActualizada.Nombre;
            consola.Precio = consolaActualizada.Precio;
            consola.Stock = consolaActualizada.Stock;
            consola.Marca = consolaActualizada.Marca;
            consola.Almacenamiento = consolaActualizada.Almacenamiento;

            GuardarEnJson();
            return true;
        }

        public bool EliminarConsola(int id)
        {
            var consola = ObtenerPorId(id);
            if (consola != null)
            {
                _consolas.Remove(consola);
                GuardarEnJson();
                return true;
            }
            return false;
        }
    }
}
