/* ============================================================
   Flor y Nata — lógica de la tienda
   Catálogo, filtros, carrito (con localStorage) y formulario.
   ============================================================ */

'use strict';

/* ---------- Datos del catálogo ---------- */
const PRODUCTOS = [
  { id: 1, nombre: 'Ramo Primavera',    categoria: 'ramos',    precio: 29.9, art: '💐', desc: 'Tulipanes y ranúnculos de temporada.' },
  { id: 2, nombre: 'Doce Rosas Rojas',  categoria: 'ramos',    precio: 44.5, art: '🌹', desc: 'El clásico que nunca falla.' },
  { id: 3, nombre: 'Girasoles XL',      categoria: 'ramos',    precio: 24.0, art: '🌻', desc: 'Cinco girasoles grandes con eucalipto.' },
  { id: 4, nombre: 'Orquídea Blanca',   categoria: 'plantas',  precio: 34.9, art: '🪴', desc: 'Phalaenopsis en maceta cerámica.' },
  { id: 5, nombre: 'Cactus Mini',       categoria: 'plantas',  precio: 12.5, art: '🌵', desc: 'Trío de cactus para escritorio.' },
  { id: 6, nombre: 'Hoja de Monstera',  categoria: 'plantas',  precio: 19.9, art: '🌿', desc: 'Planta de interior muy agradecida.' },
  { id: 7, nombre: 'Centro Boda',       categoria: 'centros',  precio: 59.0, art: '🏵️', desc: 'Composición baja para mesa.' },
  { id: 8, nombre: 'Corona Temporada',  categoria: 'centros',  precio: 39.9, art: '🎍', desc: 'Corona de flor seca para puerta.' },
  { id: 9, nombre: 'Cesta Tulipanes',   categoria: 'centros',  precio: 32.0, art: '🌷', desc: 'Quince tulipanes en cesta de mimbre.' }
];

const CLAVE_STORAGE = 'florynata_carrito';

/* ---------- Estado ---------- */
let carrito = cargarCarrito();
let filtroActivo = 'todos';

/* ---------- Referencias al DOM ---------- */
const $grid       = document.getElementById('product-grid');
const $filtros    = document.getElementById('filters');
const $cart       = document.getElementById('cart');
const $cartList   = document.getElementById('cart-list');
const $cartCount  = document.getElementById('cart-count');
const $cartTotal  = document.getElementById('cart-total');
const $overlay    = document.getElementById('overlay');
const $form       = document.getElementById('contact-form');
const $formMsg    = document.getElementById('form-msg');
const $nav        = document.getElementById('nav');
const $navToggle  = document.getElementById('nav-toggle');

/* ---------- Utilidades ---------- */
const formatearPrecio = (valor) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(valor);

function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_STORAGE));
    return Array.isArray(guardado) ? guardado : [];
  } catch (e) {
    return [];
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_STORAGE, JSON.stringify(carrito));
  } catch (e) {
    /* modo privado o almacenamiento lleno: seguimos sin persistir */
  }
}

function avisar(texto) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = texto;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('is-visible'));
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 250);
  }, 1800);
}

/* ---------- Catálogo ---------- */
function pintarProductos() {
  const lista = filtroActivo === 'todos'
    ? PRODUCTOS
    : PRODUCTOS.filter((p) => p.categoria === filtroActivo);

  $grid.innerHTML = lista.map((p) => `
    <article class="card">
      <div class="card__art" aria-hidden="true">${p.art}</div>
      <div class="card__body">
        <h3 class="card__name">${p.nombre}</h3>
        <p class="card__desc">${p.desc}</p>
        <div class="card__foot">
          <span class="card__price">${formatearPrecio(p.precio)}</span>
          <button class="card__add" data-add="${p.id}">Añadir</button>
        </div>
      </div>
    </article>
  `).join('');
}

/* ---------- Carrito ---------- */
function anadirAlCarrito(id) {
  const producto = PRODUCTOS.find((p) => p.id === id);
  if (!producto) return;

  const linea = carrito.find((item) => item.id === id);
  if (linea) {
    linea.cantidad += 1;
  } else {
    carrito.push({ id, cantidad: 1 });
  }

  guardarCarrito();
  pintarCarrito();
  avisar(`${producto.nombre} añadido al carrito`);
}

function cambiarCantidad(id, delta) {
  const linea = carrito.find((item) => item.id === id);
  if (!linea) return;

  linea.cantidad += delta;
  if (linea.cantidad <= 0) {
    carrito = carrito.filter((item) => item.id !== id);
  }

  guardarCarrito();
  pintarCarrito();
}

function totalCarrito() {
  return carrito.reduce((suma, item) => {
    const producto = PRODUCTOS.find((p) => p.id === item.id);
    return producto ? suma + producto.precio * item.cantidad : suma;
  }, 0);
}

function pintarCarrito() {
  const unidades = carrito.reduce((n, item) => n + item.cantidad, 0);
  $cartCount.textContent = unidades;
  $cartTotal.textContent = formatearPrecio(totalCarrito());

  if (carrito.length === 0) {
    $cartList.innerHTML = '<li class="cart__empty">Tu carrito está vacío.</li>';
    return;
  }

  $cartList.innerHTML = carrito.map((item) => {
    const p = PRODUCTOS.find((prod) => prod.id === item.id);
    if (!p) return '';
    return `
      <li class="cart-item">
        <span class="cart-item__art" aria-hidden="true">${p.art}</span>
        <div>
          <p class="cart-item__name">${p.nombre}</p>
          <p class="cart-item__price">${item.cantidad} × ${formatearPrecio(p.precio)}</p>
        </div>
        <div class="cart-item__qty">
          <button data-menos="${p.id}" aria-label="Quitar una unidad de ${p.nombre}">−</button>
          <span>${item.cantidad}</span>
          <button data-mas="${p.id}" aria-label="Añadir una unidad de ${p.nombre}">+</button>
        </div>
      </li>
    `;
  }).join('');
}

function abrirCarrito() {
  $cart.classList.add('is-open');
  $cart.setAttribute('aria-hidden', 'false');
  $overlay.hidden = false;
}

function cerrarCarrito() {
  $cart.classList.remove('is-open');
  $cart.setAttribute('aria-hidden', 'true');
  $overlay.hidden = true;
}

/* ---------- Formulario ---------- */
function validarFormulario() {
  const campos = [
    { el: document.getElementById('nombre'),  valido: (v) => v.trim().length >= 2 },
    { el: document.getElementById('email'),   valido: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
    { el: document.getElementById('mensaje'), valido: (v) => v.trim().length >= 10 }
  ];

  let todoOk = true;
  campos.forEach(({ el, valido }) => {
    const ok = valido(el.value);
    el.classList.toggle('error', !ok);
    if (!ok) todoOk = false;
  });

  return todoOk;
}

/* ---------- Eventos ---------- */
$grid.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-add]');
  if (boton) anadirAlCarrito(Number(boton.dataset.add));
});

$filtros.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;

  filtroActivo = chip.dataset.filter;
  $filtros.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip--active'));
  chip.classList.add('chip--active');
  pintarProductos();
});

$cartList.addEventListener('click', (e) => {
  const mas = e.target.closest('[data-mas]');
  const menos = e.target.closest('[data-menos]');
  if (mas) cambiarCantidad(Number(mas.dataset.mas), 1);
  if (menos) cambiarCantidad(Number(menos.dataset.menos), -1);
});

document.getElementById('cart-btn').addEventListener('click', abrirCarrito);
document.getElementById('cart-close').addEventListener('click', cerrarCarrito);
$overlay.addEventListener('click', cerrarCarrito);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') cerrarCarrito();
});

document.getElementById('checkout').addEventListener('click', () => {
  if (carrito.length === 0) {
    avisar('Añade algún producto antes de continuar');
    return;
  }
  avisar(`¡Gracias! Pedido de ${formatearPrecio(totalCarrito())} registrado`);
  carrito = [];
  guardarCarrito();
  pintarCarrito();
  cerrarCarrito();
});

$navToggle.addEventListener('click', () => {
  const abierto = $nav.classList.toggle('is-open');
  $navToggle.setAttribute('aria-expanded', String(abierto));
});

$nav.addEventListener('click', () => {
  $nav.classList.remove('is-open');
  $navToggle.setAttribute('aria-expanded', 'false');
});

$form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    $formMsg.textContent = 'Revisa los campos marcados en rojo.';
    $formMsg.className = 'form__msg form__msg--ko';
    return;
  }

  $formMsg.textContent = '¡Mensaje enviado! Te respondemos en menos de 24 h.';
  $formMsg.className = 'form__msg form__msg--ok';
  $form.reset();
});

/* ---------- Inicio ---------- */
document.getElementById('year').textContent = new Date().getFullYear();
pintarProductos();
pintarCarrito();
