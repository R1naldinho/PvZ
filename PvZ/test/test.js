const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const CellSize = 100;
const speed = 0.5;

// Genera punti casuali P e Z
const P = { x: Math.random() * 1000, y: Math.random() * 1000 };
let Z = { x: Math.random() * 1000, y: P.y };
const initialZ = { x: Z.x, y: Z.y }; // Salviamo la posizione iniziale di Z

// Calcola le coordinate del vertice V
const V = {
  x: (P.x + Z.x) / 2,
  y: P.y + CellSize
};

// Calcola i coefficienti della parabola
const a = CellSize / Math.pow((P.x - V.x) * (Z.x - V.x), 2);
const b = -2 * a * V.x;
const c = P.y - a * Math.pow(P.x - V.x, 2) - b * P.x;

// Funzione per calcolare la coordinata y data una coordinata x
function calculateY(x) {
  return a * Math.pow(x, 2) + b * x + c;
}

// Disegna la parabola e i punti P, Z e Z iniziale sul canvas
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Disegna la parabola
  ctx.beginPath();
  for (let x = 0; x <= 1000; x += 10) {
    const y = calculateY(x);
    ctx.lineTo(x, y);
  }
  ctx.strokeStyle = 'blue';
  ctx.stroke();

  // Disegna i punti P, Z e Z iniziale
  ctx.fillStyle = 'red';
  ctx.beginPath();
  ctx.arc(P.x, P.y, 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = 'green';
  ctx.beginPath();
  ctx.arc(initialZ.x, initialZ.y, 5, 0, 2 * Math.PI);
  ctx.fill();

  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(Z.x, Z.y, 5, 0, 2 * Math.PI);
  ctx.fill();
}

// Aggiorna la posizione di Z e ridisegna la parabola
function update() {
  Z.x += speed;
  Z.y = calculateY(Z.x);
  draw();
  requestAnimationFrame(update);
}

// Avvia l'animazione
update();
