import { ref, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { db } from "./firebase-config.js";

/**
 * Módulo de Configuración de Parámetros Avícolas
 * Estructura limpia y escalable para conectar fácilmente con ESP32 / Backend.
 */

// 1. ESTADO INICIAL (Datos exactos de la tabla de referencia)
const INITIAL_CONFIG = [
    {Dia_Desde: 0,  Dia_Hasta: 3,  Temp_Min: 30, Temp_Max: 32, Hum_Min: 50, Hum_Max: 60, Luz_Min: 40, Luz_Max: 50, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 4,  Dia_Hasta: 7,  Temp_Min: 28, Temp_Max: 30, Hum_Min: 50, Hum_Max: 60, Luz_Min: 40, Luz_Max: 50, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 8,  Dia_Hasta: 14, Temp_Min: 26, Temp_Max: 28, Hum_Min: 50, Hum_Max: 60, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 15, Dia_Hasta: 21, Temp_Min: 24, Temp_Max: 26, Hum_Min: 50, Hum_Max: 60, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 22, Dia_Hasta: 28, Temp_Min: 22, Temp_Max: 24, Hum_Min: 50, Hum_Max: 70, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 },
    {Dia_Desde: 29, Dia_Hasta: 46, Temp_Min: 20, Temp_Max: 22, Hum_Min: 50, Hum_Max: 70, Luz_Min: 10, Luz_Max: 20, Hora_Desde: 5, Minuto_Desde: 30, Hora_Hasta: 22, Minuto_Hasta: 30 }
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
                    id="Fila${rowIndex}-${field}" 
                    value="${value}" 
                    min="${min}" 
                    max="${max}" 
                    step="${step}"
                    data-row="${rowIndex}" 
                    data-field="${field}"
                    required
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
            ${createInputCell(index, 'Dia_Desde', row.Dia_Desde,     'd', 0, 365, 1)}
            ${createInputCell(index, 'Dia_Hasta',   row.Dia_Hasta,   'd', 0, 365, 1)}
             
            <!-- SP Temp (°C) -->
            ${createInputCell(index, 'Temp_Min',  row.Temp_Min,  '°C',  10, 45, 0.1)}
            ${createInputCell(index, 'Temp_Max',  row.Temp_Max,  '°C',  10, 45, 0.1)}
            
            <!-- SP Hum (%) -->
            ${createInputCell(index, 'Hum_Min',    row.Hum_Min,    '%', 0, 100, 1)}
            ${createInputCell(index, 'Hum_Max',    row.Hum_Max,    '%', 0, 100, 1)}
            
            <!-- SP Luz (%) -->
            ${createInputCell(index, 'Luz_Min', row.Luz_Min, '%', 0, 100, 1)}
            ${createInputCell(index, 'Luz_Max', row.Luz_Max, '%', 0, 100, 1)}
            
            <!-- Horarios de iluminación: Inicio (hs / m) -->
            ${createInputCell(index, 'Hora_Desde',      row.Hora_Desde,      'hs', 0, 23, 1)}
            ${createInputCell(index, 'Minuto_Desde',    row.Minuto_Desde,    'm',  0, 59, 1)}
            
            <!-- Horarios de iluminación: Fin (hs / m) -->
            ${createInputCell(index, 'Hora_Hasta',     row.Hora_Hasta,     'hs', 0, 23, 1)}
            ${createInputCell(index, 'Minuto_Hasta',   row.Minuto_Hasta,   'm',  0, 59, 1)}
            
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

    if (validarCampos() == false) {
    return;
    }

    const rowIndex = Number(Input_Box.target.dataset.row);
    const field = Input_Box.target.dataset.field;
    const val = parseFloat(Input_Box.target.value) || 0;
    configRows[rowIndex][field] = val;
});

function validarCampos() {
    const Lista_De_Campos = tableBody.querySelectorAll('input[type="number"]');

    for (const Campo of Lista_De_Campos) {
        // Si no cumple con algo
        if (Campo.checkValidity() === false) {
            
            const estado = Campo.validity;
            const min = Campo.min;
            const max = Campo.max;

            if (estado.valueMissing) {
                showStatus("El campo no puede estar vacío.", true);
                return false;
            }
            if (estado.rangeUnderflow) {
                showStatus(`El número debe ser mayor o igual a '${min}'.`, true);
                return false;
            } 
            if (estado.rangeOverflow) {
                showStatus(`El número debe ser menor o igual a '${max}'.`, true);
                return false;
            } 
            if (estado.badInput) {
                showStatus("Por favor, ingresa un número válido.", true);
                return false;
            } 
            if (estado.stepMismatch) {
                showStatus("No se permiten decimales. Ingresa un número entero.", true);
                return false;
            }
        }
    }
return true;
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
  
    if (validarCampos() == false) {
        return;
    }
    if (validarConfiguracion() == false) {
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
    }, 3000);
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
        // Validaciones de consistencia para cada fila
        const row = configRows[i];
        if (row.Dia_Desde > row.Dia_Hasta) {
            showStatus(`Etapa ${i + 1}: La fecha de inicio debe ser anterior a la fecha de finalización.`, true);
            return false;
        }
        if (row.Temp_Min > row.Temp_Max) {
            showStatus(`Etapa ${i + 1}: La temperatura mínima debe ser menor que la máxima.`, true);
            return false;
        }
        if (row.Hum_Min > row.Hum_Max) {
            showStatus(`Etapa ${i + 1}: La humedad mínima debe ser menor que la máxima.`, true);
            return false;
        }
        if (row.Luz_Min > row.Luz_Max) {
            showStatus(`Etapa ${i + 1}: La luz mínima debe ser menor que la máxima.`, true);
            return false;
        }
        if (row.Hora_Desde > row.Hora_Hasta) {
            showStatus(`Etapa ${i + 1}: La hora de inicio debe ser anterior a la hora de finalización.`, true);
            return false;
        }
        if ((row.Dia_Desde === row.Dia_Hasta)&&(row.Hora_Desde >= row.Hora_Hasta)&&(row.Minuto_Desde > row.Minuto_Hasta)) {
            showStatus(`Etapa ${i + 1}: El minuto de inicio debe ser anterior al minuto de finalización.`, true);
            return false;
        }
        // Validación de solapamiento entre etapas
        if (i < configRows.length - 1 && row.Dia_Hasta >= configRows[i + 1].Dia_Desde ) {
            showStatus(`Se solapan los días de la Etapa ${i + 1} con la Etapa ${i + 2}.`, true);
            return false;
        } 
        if (i < configRows.length - 1 && (row.Dia_Hasta + 1) !== configRows[i + 1].Dia_Desde ) {
            showStatus(`Hay un hueco de días entre la Etapa ${i + 1} y la Etapa ${i + 2}.`, true);
            return false;
        }         
    }
return true;
}

// 6. INICIALIZACIÓN
renderTable();