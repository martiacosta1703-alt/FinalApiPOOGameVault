using TiendaVideojuegos.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<ProductoService>();
builder.Services.AddSingleton<ConsolaService>();
builder.Services.AddSingleton<AccesorioService>();
builder.Services.AddSingleton<ClienteService>();
builder.Services.AddSingleton<CarritoService>();
builder.Services.AddSingleton<CompraService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Página web (carpeta wwwroot)
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthorization();
app.MapControllers();

app.Run();