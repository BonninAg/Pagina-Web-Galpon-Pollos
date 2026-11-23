import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db } from "./firebase-config.js";

/**
 * Módulo de Configuración de Parámetros Avícolas
 * Estructura limpia y escalable para conectar fácilmente con ESP32 / Backend.
 */

// 1. ESTADO INICIAL (Datos exactos de la tabla de referencia)
const INITIAL_CONFIG = [
    { etapa: 1, dayStart: 0,  dayEnd: 3,  tempMin: 30, tempMax: 32, hrMin: 50, hrMax: 60, lightMin: 40, lightMax: 50, onHour: 5, onMin: 30, offHour: 22, offMin: 30 },
    { etapa: 2, dayStart: 3,  dayEnd: 7,  tempMin: 28, tempMax: 30, hrMin: 50, hrMax: 60, lightMin: 40, lightMax: 50, onHour: 5, onMin: 30, offHour: 22, offMin: 30 },
    { etapa: 3, dayStart: 8,  dayEnd: 14, tempMin: 26, tempMax: 28, hrMin: 50, hrMax: 60, lightMin: 10, lightMax: 20, onHour: 5, onMin: 30, offHour: 22, offMin: 30 },
    { etapa: 4, dayStart: 15, dayEnd: 21, tempMin: 24, tempMax: 26, hrMin: 50, hrMax: 60, lightMin: 10, lightMax: 20, onHour: 5, onMin: 30, offHour: 22, offMin: 30 },
    { etapa: 5, dayStart: 22, dayEnd: 28, tempMin: 22, tempMax: 24, hrMin: 50, hrMax: 70, lightMin: 10, lightMax: 20, onHour: 5, onMin: 30, offHour: 22, offMin: 30 },
    { etapa: 6, dayStart: 29, dayEnd: 46, tempMin: 20, tempMax: 22, hrMin: 50, hrMax: 70, lightMin: 10, lightMax: 20, onHour: 5, onMin: 30, offHour: 22, offMin: 30 }
];

// Copia de trabajo que el usuario va modificando
let configRows = structuredClone(INITIAL_CONFIG);

// 2. REFERENCIAS AL DOM
const tableBody = document.getElementById('tableBody');
const btnAddRow = document.getElementById('btnAddRow');
const btnReset = document.getElementById('btnReset');
const btnSave = document.getElementById('btnSave');
const statusMessage = document.getElementById('statusMessage');

// 3. FUNCIONES DE RENDERIZADO
/**
 * Genera el HTML de un input numérico con su etiqueta de unidad opcional
 */
function createInputCell(rowIndex, field, value, unit = '', min, max, step) {
    return `
        <td>
            <div class="input-group">
                <input 
                    type="number" 
                    value="${value}" 
                    min="${min}" 
                    max="${max}" 
                    step="${step}"
                    data-row="${rowIndex}" 
                    data-field="${field}"
                >
                ${unit ? `<span class="unit">${unit}</span>` : ''}
            </div>
        </td>
    `;
}

/**
 * Dibuja todas las filas en el tbody basándose en el arreglo `configRows`
 */
function renderTable() {
    tableBody.innerHTML = configRows.map((row, index) => `
        <tr>   
            ${createInputCell(index, 'etapa', index +1 , '', 0, 120, 1)}
            
            <!-- Edad (Días) -->
            ${createInputCell(index, 'dayStart', row.dayStart, 'd', 0, 365, 1)}
            ${createInputCell(index, 'dayEnd',   row.dayEnd,   'd', 0, 24, 1)}
            
            <!-- SP Temp (°C) -->
            ${createInputCell(index, 'tempMin',  row.tempMin,  '°C',  10, 45, 1)}
            ${createInputCell(index, 'tempMax',  row.tempMax,  '°C',  10, 45, 1)}
            
            <!-- SP Hum (%) -->
            ${createInputCell(index, 'hrMin',    row.hrMin,    '%', 0, 100, 1)}
            ${createInputCell(index, 'hrMax',    row.hrMax,    '%', 0, 100, 1)}
            
            <!-- SP Luz (%) -->
            ${createInputCell(index, 'lightMin', row.lightMin, '%', 0, 100, 1)}
            ${createInputCell(index, 'lightMax', row.lightMax, '%', 0, 100, 1)}
            
            <!-- Horarios de iluminación: Inicio (hs / m) -->
            ${createInputCell(index, 'onHour',   row.onHour,   'hs', 0, 23, 1)}
            ${createInputCell(index, 'onMin',    row.onMin,    'm',  0, 59, 1)}
            
            <!-- Horarios de iluminación: Fin (hs / m) -->
            ${createInputCell(index, 'offHour',  row.offHour,  'hs', 0, 23, 1)}
            ${createInputCell(index, 'offMin',   row.offMin,   'm',  0, 59, 1)}
            
            <!-- Eliminar fila -->
            <td>
                <button type="button" class="btn-delete" data-delete="${index}" title="Eliminar etapa">✕</button>
            </td>
        </tr>
    `).join('');
}

// 4. MANEJADORES DE EVENTOS (Delegación de eventos para mayor eficiencia)
tableBody.addEventListener('change', (e) => {
    if (e.target.tagName === 'INPUT') {
        const rowIndex = Number(e.target.dataset.row);
        const field = e.target.dataset.field;
        const val = parseFloat(e.target.value) || 0;
        
        configRows[rowIndex][field] = val;
    }
});

tableBody.addEventListener('click', (e) => {
    const deleteBtn = e.target.closest('[data-delete]');
    if (deleteBtn) {
        if (configRows.length <= 1) {
            showStatus('Debe existir al menos una etapa en la tabla.', true);
            return;
        }
        const index = Number(deleteBtn.dataset.delete);
        configRows.splice(index, 1);
        renderTable();
    }
});

btnAddRow.addEventListener('click', () => {
    const lastRow = configRows[configRows.length - 1];
    const nextStart = lastRow ? lastRow.dayEnd + 1 : 0;

    configRows.push({
        dayStart: nextStart,
        dayEnd: nextStart + 7,
        tempMin: lastRow ? Math.max(18, lastRow.tempMin - 2) : 20,
        tempMax: lastRow ? Math.max(20, lastRow.tempMax - 2) : 22,
        hrMin: 50,
        hrMax: 70,
        lightMin: 10,
        lightMax: 20,
        onHour: 5,
        onMin: 30,
        offHour: 22,
        offMin: 30
    });

    renderTable();
});

btnReset.addEventListener('click', () => {
    configRows = structuredClone(INITIAL_CONFIG);
    renderTable();
    showStatus('Valores restablecidos a la tabla original.');
});

btnSave.addEventListener('click', async () => {

    const error = validarConfiguracion();

    if (error) {
        showStatus(error, true);
        return;
    }

    await saveConfigToFirebase();
});


// 5. UTILIDADES
function showStatus(text, isError = false) {
    statusMessage.textContent = text;
    statusMessage.style.borderColor = isError ? 'var(--danger)' : 'var(--success)';
    statusMessage.style.color = isError ? 'var(--danger)' : 'var(--success)';
    statusMessage.classList.remove('hidden');

    setTimeout(() => {
        statusMessage.classList.add('hidden');
    }, 4000);
}

async function saveConfigToFirebase() {
    try {
        // Generar objeto a partir de las filas actuales de la tabla
        const payload = {};

        configRows.forEach((row, index) => {
            payload[`Etapa_${index + 1}`] = row;
        });

        // Referencia al nodo donde se guardará la configuración
        const configRef = ref(db, "Configuracion");

        // Guardar / reemplazar todo el nodo
        await set(configRef, payload);

        console.log('Configuración enviada a Firebase:', payload);
        showStatus('Configuración guardada correctamente en Firebase.');

    } catch (error) {
        console.error('Error al guardar la configuración:', error);
        showStatus('Error al guardar la configuración en Firebase.', true);
    }
}


function validarConfiguracion() {
    for (let i = 0; i < configRows.length; i++) {

        const row = configRows[i];
        const error = validarRangos(row);
        if (error) {
            return `Etapa ${i + 1}: ${error}`;
        }
    }
    return null;
}
function validarRangos(row) {
    if (row.tempMin >= row.tempMax) {
        return "La temperatura mínima debe ser menor que la máxima.";
    }

    if (row.hrMin >= row.hrMax) {
        return "La humedad mínima debe ser menor que la máxima.";
    }

    if (row.lightMin >= row.lightMax) {
        return "La luz mínima debe ser menor que la máxima.";
    }

    return null;
}


/*
function validarRangos(row) {

    let validado = true;

    if (row.tempMin >= row.tempMax) {
        showStatus("La temperatura mínima debe ser menor que la máxima.", true);
        validado = false;
    }
    if (row.hrMin >= row.hrMax) {
        showStatus("La humedad mínima debe ser menor que la máxima.", true);
        validado = false;
    } 
    if (row.lightMin >= row.lightMax) {
        showStatus("La luz mínima debe ser menor que la máxima.", true);
        validado = false;
    }
    return validado;
}
*/



// 6. INICIALIZACIÓN
renderTable();