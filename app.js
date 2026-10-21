// ==========================================
// CONFIGURACIÓN PÚBLICA (CLIENTE)
// ==========================================
const CONFIG_SHAMMAH = {
    URL_API_GOOGLE: "https://script.google.com/macros/s/AKfycbzDXRDZUXn4mYl1pSTOdW05sT50foV94CrK9L1U026nDzbAxHIR3n0o9FOr2ayU-de8/exec",
    COSTO_GRAMO: 0.50,
    COSTO_HORA: 9.00,
    HERRAJE_CLICKER: 2.63,
    PORCENTAJE_REDES: 0.05,
    PORCENTAJE_RESICO: 0.01,
    NUM_WHATSAPP: "5215559650025"
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
// MOTOR DE COTIZACIÓN
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
// CONEXIÓN API CON AUTORIZACIÓN POR SERVIDOR
// ==========================================
async function obtenerDatosSheets(pin) {
    try {
        const url = `${CONFIG_SHAMMAH.URL_API_GOOGLE}?pin=${encodeURIComponent(pin || '')}`;
        const res = await fetch(url);
        const data = await res.json();
        return data;
    } catch (e) {
        console.error("Error al obtener datos:", e);
        return { autorizado: false, error: e.toString() };
    }
}

async function sincronizarGoogleSheets(dataArray, pin) {
    try {
        await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                pin: pin,
                data: dataArray
            })
        });
        return true;
    } catch (e) {
        console.error("Error al sincronizar:", e);
        return false;
    }
}

async function enviarCotizacionDesdeMostrador(datosCotizacion) {
    try {
        await fetch(CONFIG_SHAMMAH.URL_API_GOOGLE, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                tipo: "NUEVA_COTIZACION",
                datos: datosCotizacion
            })
        });
        return true;
    } catch (e) {
        console.error("Error enviando cotización:", e);
        return false;
    }
}
