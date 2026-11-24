import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db } from "./firebase-config.js";

/**
 * Módulo de Configuración de Parámetros Avícolas
 * Estructura limpia y escalable para conectar fácilmente con ESP32 / Backend.
 */

// 1. ESTADO INICIAL (Datos exactos de la tabla de referencia)
const INITIAL_CONFIG = [
    {Dia_Desde: 0,  Dia_Hasta: 3,  Temp_Min: 30, Temp_Max: 32, Hum_Min: 50, Hum_Max: 60, Luz_Min: 40, Luz_Max: 50, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 3,  Dia_Hasta: 7,  Temp_Min: 28, Temp_Max: 30, Hum_Min: 50, Hum_Max: 60, Luz_Min: 40, Luz_Max: 50, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 8,  Dia_Hasta: 14, Temp_Min: 26, Temp_Max: 28, Hum_Min: 50, Hum_Max: 60, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 15, Dia_Hasta: 21, Temp_Min: 24, Temp_Max: 26, Hum_Min: 50, Hum_Max: 60, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 22, Dia_Hasta: 28, Temp_Min: 22, Temp_Max: 24, Hum_Min: 50, Hum_Max: 70, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 28, Dia_Hasta: 46, Temp_Min: 20, Temp_Max: 22, Hum_Min: 50, Hum_Max: 70, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 }
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
            <td> ${index +1} </td>

            <!-- Edad (Días) -->
            ${createInputCell(index, 'dayStart', row.Dia_Desde, 'd', 0, 365, 1)}
            ${createInputCell(index, 'dayEnd',   row.Dia_Hasta,   'd', 0, 365, 1)}
            
            <!-- SP Temp (°C) -->
            ${createInputCell(index, 'tempMin',  row.Temp_Min,  '°C',  10, 45, 0.1)}
            ${createInputCell(index, 'tempMax',  row.Temp_Max,  '°C',  10, 45, 0.1)}
            
            <!-- SP Hum (%) -->
            ${createInputCell(index, 'hrMin',    row.Hum_Min,    '%', 0, 100, 1)}
            ${createInputCell(index, 'hrMax',    row.Hum_Max,    '%', 0, 100, 1)}
            
            <!-- SP Luz (%) -->
            ${createInputCell(index, 'lightMin', row.Luz_Min, '%', 0, 100, 1)}
            ${createInputCell(index, 'lightMax', row.Luz_Max, '%', 0, 100, 1)}
            
            <!-- Horarios de iluminación: Inicio (hs / m) -->
            ${createInputCell(index, 'onHour',   row.Hora_Desde,   'hs', 0, 23, 1)}
            ${createInputCell(index, 'onMin',    row.Minuto_Desde,    'm',  0, 59, 1)}
            
            <!-- Horarios de iluminación: Fin (hs / m) -->
            ${createInputCell(index, 'offHour',  row.Hora_Hasta,  'hs', 0, 23, 1)}
            ${createInputCell(index, 'offMin',   row.Minuto_Hasta,   'm',  0, 59, 1)}
            
            <!-- Eliminar fila -->
            <td>
                <button type="button" class="btn-delete" data-delete="${index}" title="Eliminar etapa">✕</button>
            </td>
        </tr>
    `).join('');
}

// 4. MANEJADORES DE EVENTOS (Delegación de eventos para mayor eficiencia)
tableBody.addEventListener('change', (Input_Box) => {
    if (Input_Box.target.tagName !== 'INPUT') {
        return;
    }

    const rowIndex = Number(Input_Box.target.dataset.row);
    const field = Input_Box.target.dataset.field;
    const val = parseFloat(Input_Box.target.value) || 0;
    configRows[rowIndex][field] = val;
    
    const estado = Input_Box.target.validity;
    const min = Input_Box.target.min;
    const max = Input_Box.target.max;
    Error_De_Campo = validarCampo (estado, min, max);

});

function validarCampo(estado, min, max) {
   
  if (estado.valueMissing) {
    showStatus("El campo no puede estar vacío.", true);
    Error_De_Campo = "El campo no puede estar vacío."
    
  } else if (estado.rangeUnderflow) {
    showStatus(`El número debe ser mayor o igual a '${min}'.`, true);
    Error_De_Campo = `El número debe ser mayor o igual a '${min}'.`;

  } else if (estado.rangeOverflow) {
    showStatus(`El número debe ser menor o igual a '${max}'.`, true);
    Error_De_Campo = `El número debe ser menor o igual a '${max}'.`;

  } else if (estado.badInput) {
    showStatus("Por favor, ingresa un número válido.", true);
    Error_De_Campo = "Por favor, ingresa un número válido.";

  } else if (estado.stepMismatch) {
    showStatus("No se permiten decimales. Ingresa un número entero.", true);
    Error_De_Campo = "No se permiten decimales. Ingresa un número entero.";
  } else {
    Error_De_Campo = null;
  }

  return Error_De_Campo;
}

tableBody.addEventListener('click', (Input_Box) => {
    const deleteBtn = Input_Box.target.closest('[data-delete]');
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
    const nextStart = lastRow ? lastRow.Dia_Hasta + 1 : 0;

    configRows.push({
        Dia_Desde: nextStart,
        Dia_Hasta: nextStart + 7,
        Temp_Min: lastRow ? Math.max(18, lastRow.Temp_Min - 2) : 20,
        Temp_Max: lastRow ? Math.max(20, lastRow.Temp_Max - 2) : 22,
        Hum_Min: 50,
        Hum_Max: 70,
        Luz_Min: 10,
        Luz_Max: 20,
        Hora_Desde: 5,
        Minuto_Desde: 30,
        Hora_Hasta: 22,
        Minuto_Hasta: 30
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
    }, 10000);
}

async function saveConfigToFirebase() {
    try {
        // Generar objeto a partir de las filas actuales de la tabla
        const payload = {};

        configRows.forEach((row, index) => {
            payload[`${index}`] = row;
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
    if (row.Temp_Min >= row.Temp_Max) {
        return "La temperatura mínima debe ser menor que la máxima.";
    }
    if (row.Hum_Min >= row.Hum_Max) {
        return "La humedad mínima debe ser menor que la máxima.";
    }
    if (row.Luz_Min >= row.Luz_Max) {
        return "La luz mínima debe ser menor que la máxima.";
    }
    return null;
}


// 6. INICIALIZACIÓN
renderTable();