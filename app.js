// ==========================================
// CONFIGURACIÓN GLOBAL Y PARÁMETROS DEL TALLER
// ==========================================
const CONFIG_SHAMMAH = {
    URL_API_GOOGLE: "https://script.google.com/macros/s/AKfycbzDXRDZUXn4mYl1pSTOdW05sT50foV94CrK9L1U026nDzbAxHIR3n0o9FOr2ayU-de8/exec",
    COSTO_GRAMO: 0.50,
    COSTO_HORA: 9.00,
    HERRAJE_CLICKER: 2.63,
    PORCENTAJE_REDES: 0.05,
    PORCENTAJE_RESICO: 0.01,
    NUM_WHATSAPP: "5215559650025",
    PIN_ADMIN: "0000" // Puedes cambiar este PIN de acceso para admin.html
};

// ==========================================
// PARSERS Y FORMATO DE TIEMPO
// ==========================================
function parseTiempo(val) {
    let str = (val || '').toString().trim().toLowerCase();
    if (!str) return 0;
    if (str.includes(':')) {
        let p = str.split(':');
        return (parseFloat(p[0]) || 0) + ((parseFloat(p[1]) || 0) / 60);
    }
    if (str.includes('h') || str.includes('m')) {
        let hMatch = str.match(/(\d+)\s*h/);
        let mMatch = str.match(/(\d+)\s*m/);
        let h = hMatch ? parseFloat(hMatch[1]) : 0;
        let m = mMatch ? parseFloat(mMatch[2] || mMatch[1]) : 0;
        return h + (m / 60);
    }
    return parseFloat(str) || 0;
}

function formatTiempoVisual(horasDec) {
    let totalMin = Math.round(horasDec * 60);
    if (totalMin < 60) return `${totalMin}m`;
    let h = Math.floor(totalMin / 60);
    let m = totalMin % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ==========================================
// MOTOR DE COTIZACIÓN Y REGLAS DE NEGOCIO
// ==========================================
function calcularCostoDirectoUnitario(gramos, horasDecimales, tipoNegocio) {
    const g = parseFloat(gramos) || 0;
    const h = parseFloat(horasDecimales) || 0;
    let costo = (g * CONFIG_SHAMMAH.COSTO_GRAMO) + (h * CONFIG_SHAMMAH.COSTO_HORA);
    if (tipoNegocio === 'clicker') costo += CONFIG_SHAMMAH.HERRAJE_CLICKER;
    return costo;
}

function obtenerMultiplicadorMayoreo(cantidad) {
    if (cantidad >= 12) return 2.2;
    if (cantidad >= 6) return 2.5;
    return 3.0;
}

function calcularDesgloseFinanciero(totalMonto, costoDirectoTotal = 0) {
    const total = parseFloat(totalMonto) || 0;
    const costoDir = parseFloat(costoDirectoTotal) || 0;
    const f_redes = total * CONFIG_SHAMMAH.PORCENTAJE_REDES;
    const f_resico = total * CONFIG_SHAMMAH.PORCENTAJE_RESICO;
    const utilidad = total - (f_redes + f_resico + costoDir);

    return { total, f_redes, f_resico, costoDir, utilidad };
}

// ==========================================
// CONECTOR API GOOGLE SHEETS (PERSISTENCIA)
// ==========================================
async function obtenerDatosSheets() {
    try {
        const res = await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE);
        const data = await res.json();
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Error al obtener datos de Google Sheets:", e);
        return [];
    }
}

async function sincronizarGoogleSheets(dataArray) {
    try {
        await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dataArray)
        });
        return true;
    } catch (e) {
        console.error("Error al sincronizar con Google Sheets:", e);
        return false;
    }
}
