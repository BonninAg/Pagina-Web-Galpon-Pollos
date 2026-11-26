// ==========================================
// 1. CONFIGURACIÓN Y ESTADO INICIAL
// ==========================================
const configEtapa = {
    nombre: "Crecimiento (Semana 3)",
    dia: 18,
    tempObjetivo: 24.5,
    humObjetivo: 60,
    luzObjetivo: 20
};

// Coordenadas (x, y) en porcentaje (%) respecto a la imagen del galpón
let nodos = [
    { id: 1, nombre: "Nodo Norte", x: 25, y: 35, temp: 24.2, hum: 58, luz: 21, icono: "https://placehold.co/32x32/2563eb/ffffff?text=N1" },
    { id: 2, nombre: "Nodo Centro", x: 50, y: 55, temp: 24.8, hum: 61, luz: 19, icono: "https://placehold.co/32x32/2563eb/ffffff?text=N2" },
    { id: 3, nombre: "Nodo Sur", x: 78, y: 40, temp: 24.5, hum: 60, luz: 20, icono: "https://placehold.co/32x32/2563eb/ffffff?text=N3" }
];

// ==========================================
// 2. FUNCIONES DE RENDERIZADO (DOM)
// ==========================================
function renderizarEtapa() {
    document.getElementById("etapa-nombre").textContent = configEtapa.nombre;
    document.getElementById("etapa-dia").textContent = configEtapa.dia;
    document.getElementById("etapa-temp").textContent = configEtapa.tempObjetivo;
    document.getElementById("etapa-hum").textContent = configEtapa.humObjetivo;
    document.getElementById("etapa-luz").textContent = configEtapa.luzObjetivo;
}

function renderizarNodos() {
    const contenedor = document.getElementById("mapa-galpon");
    
    // Limpiar nodos previos antes de redibujar
    document.querySelectorAll(".nodo-card").forEach(el => el.remove());

    nodos.forEach(nodo => {
        const div = document.createElement("div");
        div.className = "nodo-card";
        div.style.left = `${nodo.x}%`;
        div.style.top = `${nodo.y}%`;

        div.innerHTML = `
            <img src="${nodo.icono}" alt="${nodo.nombre}">
            <span class="nodo-titulo">${nodo.nombre}</span>
            <div>🌡️ ${nodo.temp.toFixed(1)} °C</div>
            <div>💧 ${nodo.hum.toFixed(0)} %</div>
            <div>☀️ ${nodo.luz.toFixed(0)} lx</div>
        `;
        contenedor.appendChild(div);
    });
}

function renderizarPromedios(horaStr) {
    const total = nodos.length;
    if (total === 0) return;

    const suma = nodos.reduce((acc, n) => ({
        temp: acc.temp + n.temp,
        hum: acc.hum + n.hum,
        luz: acc.luz + n.luz
    }), { temp: 0, hum: 0, luz: 0 });

    document.getElementById("tabla-hora").textContent = horaStr;
    document.getElementById("prom-temp").textContent = `${(suma.temp / total).toFixed(1)} °C`;
    document.getElementById("prom-hum").textContent = `${(suma.hum / total).toFixed(1)} %`;
    document.getElementById("prom-luz").textContent = `${(suma.luz / total).toFixed(0)} lx`;
}

// ==========================================
// 3. OBTENCIÓN DE DATOS Y RELOJ
// ==========================================
function actualizarReloj() {
    const ahora = new Date().toLocaleTimeString("es-AR");
    document.getElementById("reloj-actual").textContent = ahora;
    return ahora;
}

// Reemplaza el interior de esta función con tu fetch() a Firebase o tu API
async function obtenerDatosEnTiempoReal() {
    // Simulación de variación de sensores en tiempo real
    nodos = nodos.map(nodo => ({
        ...nodo,
        temp: +(nodo.temp + (Math.random() - 0.5) * 0.4).toFixed(1),
        hum: Math.min(100, Math.max(0, +(nodo.hum + (Math.random() - 0.5) * 2).toFixed(0))),
        luz: Math.max(0, +(nodo.luz + (Math.random() - 0.5) * 2).toFixed(0))
    }));

    const horaActual = actualizarReloj();
    renderizarNodos();
    renderizarPromedios(horaActual);
}

// ==========================================
// 4. INICIALIZACIÓN
// ==========================================
function iniciarApp() {
    renderizarEtapa();
    obtenerDatosEnTiempoReal();

    // Actualiza el reloj cada 1 segundo
    setInterval(actualizarReloj, 1000);
    
    // Consulta nuevos datos de los sensores cada 3 segundos
    setInterval(obtenerDatosEnTiempoReal, 3000);
}

document.addEventListener("DOMContentLoaded", iniciarApp);