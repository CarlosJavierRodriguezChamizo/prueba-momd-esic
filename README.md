# Flor y Nata — web de venta de flores

Web estática de ejemplo para una floristería online, hecha con HTML, CSS y
JavaScript puros (sin dependencias ni build).

## Estructura

```
index.html      Estructura de la página (hero, catálogo, nosotros, contacto, carrito)
css/styles.css  Estilos y diseño responsive
js/app.js       Catálogo, filtros, carrito y validación del formulario
```

## Cómo verla

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000
# luego visita http://localhost:8000
```

## Qué incluye

- Catálogo generado desde un array en `js/app.js` (editable para añadir productos).
- Filtros por categoría: ramos, plantas y centros.
- Carrito lateral con sumar/restar unidades, total en euros y persistencia en
  `localStorage`.
- Formulario de contacto con validación en cliente.
- Menú móvil y diseño adaptable.

El botón «Finalizar compra» solo simula el pedido: no hay pasarela de pago ni
backend.
