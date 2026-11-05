using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using TiendaVideojuegos.Models;

namespace TiendaVideojuegos.Services
{
    public class AccesorioService
    {
        private readonly string _jsonFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "accesorios.json");
        private List<Accesorios> _accesorios = new List<Accesorios>();

        public AccesorioService()
        {
            CargarDesdeJson();
        }

        private void CargarDesdeJson()
        {
            if (File.Exists(_jsonFilePath))
            {
                var jsonText = File.ReadAllText(_jsonFilePath);
                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                _accesorios = JsonSerializer.Deserialize<List<Accesorios>>(jsonText, options) ?? new List<Accesorios>();
            }
        }

        private void GuardarEnJson()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var jsonText = JsonSerializer.Serialize(_accesorios, options);
            File.WriteAllText(_jsonFilePath, jsonText);
        }

        public List<Accesorios> ObtenerTodos() => _accesorios;

        public Accesorios? ObtenerPorId(int id) => _accesorios.FirstOrDefault(a => a.Id == id);

        public void AgregarAccesorio(Accesorios accesorio)
        {
            accesorio.Id = _accesorios.Count > 0 ? _accesorios.Max(a => a.Id) + 1 : 1;
            _accesorios.Add(accesorio);
            GuardarEnJson();
        }

        public bool ActualizarAccesorio(int id, Accesorios accesorioActualizado)
        {
            var accesorio = ObtenerPorId(id);
            if (accesorio == null) return false;

            accesorio.Nombre = accesorioActualizado.Nombre;
            accesorio.Precio = accesorioActualizado.Precio;
            accesorio.Stock = accesorioActualizado.Stock;
            accesorio.Tipo = accesorioActualizado.Tipo;
            accesorio.Compatibilidad = accesorioActualizado.Compatibilidad;

            GuardarEnJson();
            return true;
        }

        public bool EliminarAccesorio(int id)
        {
            var accesorio = ObtenerPorId(id);
            if (accesorio != null)
            {
                _accesorios.Remove(accesorio);
                GuardarEnJson();
                return true;
            }
            return false;
        }
    }
}
