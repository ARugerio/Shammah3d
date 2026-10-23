// ==========================================
// SHAMMAH CREA 3D — LÓGICA DE MOSTRADOR (app.js)
// Conexión Frontend -> Google Apps Script
// ==========================================

const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyC0c8e00F3i3_q6jJ7uS00t19-gQd7v-O6dF23E1bL3yD12sE/exec"; // Reemplaza esto con tu URL correcta si cambió

// Variables globales del cotizador
let calculoActual = {
    gramos: 0,
    minutos: 0,
    cantidad: 1,
    costoMateriaPrima: 0,
    costoTiempo: 0,
    tipoNegocio: 'venta_directa'
};

let partidaActualCotizada = null;

// ==========================================
// 1. OBTENCIÓN DE DATOS DEL PANEL (GET protegido)
// ==========================================
async function obtenerDatosSheets(pin) {
    try {
        const respuesta = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({ accion: 'obtenerDatos', pin: pin }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const data = await respuesta.json();
        return data;
    } catch (e) {
        console.error("Error obteniendo base de datos:", e);
        return null;
    }
}

// ==========================================
// 2. SINCRONIZACIÓN GERENCIAL (Panel -> DB)
// ==========================================
async function sincronizarGoogleSheets(datosLocales, pin) {
    try {
        const payload = {
            accion: 'sincronizarDatos',
            pin: pin,
            data: datosLocales
        };
        const respuesta = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        const resultado = await respuesta.json();
        return resultado.status === 'success';
    } catch (error) {
        console.error("Error sincronizando base de datos:", error);
        return false;
    }
}

// ==========================================
// 3. FLUJO DEL COTIZADOR DE MOSTRADOR (index.html)
// ==========================================

function seleccionarTipoNegocio(tipo) {
    calculoActual.tipoNegocio = tipo;
    
    document.getElementById('btnTipoVenta').classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
    document.getElementById('btnTipoClicker').classList.remove('ring-4', 'ring-pink-500', 'bg-slate-800');
    
    if (tipo === 'venta_directa') {
        document.getElementById('btnTipoVenta').classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        document.getElementById('configClickers').classList.add('hidden');
    } else {
        document.getElementById('btnTipoClicker').classList.add('ring-4', 'ring-pink-500', 'bg-slate-800');
        document.getElementById('configClickers').classList.remove('hidden');
    }
    
    if (document.getElementById('pesoGramos').value !== "") {
        cotizarEnServidor();
    }
}

async function cotizarEnServidor() {
    const gramos = parseFloat(document.getElementById('pesoGramos').value);
    const horasInput = document.getElementById('tiempoHoras').value;
    const minutosInput = document.getElementById('tiempoMinutos').value;
    const cantidad = parseInt(document.getElementById('cantidadPiezas').value) || 1;
    const boton = document.getElementById('btnCotizar');
    const areaResultados = document.getElementById('areaResultados');
    
    const h = parseFloat(horasInput) || 0;
    const m = parseFloat(minutosInput) || 0;
    const totalHoras = h + (m / 60);

    if (isNaN(gramos) || gramos <= 0 || (h === 0 && m === 0)) {
        alert('Por favor ingresa un peso válido y al menos 1 minuto de impresión.');
        return;
    }

    calculoActual.gramos = gramos;
    calculoActual.minutos = (h * 60) + m;
    calculoActual.cantidad = cantidad;

    boton.disabled = true;
    boton.innerText = "Calculando tarifa...";
    
    try {
        const respuesta = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify({
                accion: 'cotizar',
                gramos: gramos,
                horas: totalHoras,
                cantidad: cantidad,
                tipoNegocio: calculoActual.tipoNegocio
            }),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        const data = await respuesta.json();
        
        if (data.exito) {
            document.getElementById('resPrecioUnitario').innerText = `$${data.precioUnitario.toFixed(2)}`;
            document.getElementById('resPrecioTotal').innerText = `$${data.totalMonto.toFixed(2)}`;
            
            const badgeMayoreo = document.getElementById('badgeMayoreo');
            if (data.esMayoreo) {
                badgeMayoreo.innerText = `🟢 MAYOREO (${data.tipoMayoreo})`;
                badgeMayoreo.classList.remove('hidden');
            } else {
                badgeMayoreo.classList.add('hidden');
            }

            // Respalda la cotización para cuando se quiera enviar al panel
            partidaActualCotizada = {
                unitario: data.precioUnitario,
                total: data.totalMonto,
                Q: cantidad,
                gramosTotales: gramos * cantidad,
                minutosTotales: ((h * 60) + m) * cantidad
            };

            areaResultados.classList.remove('hidden');
        }
    } catch (e) {
        alert('Ocurrió un error conectando con el servidor. Intenta de nuevo.');
        console.error(e);
    } finally {
        boton.disabled = false;
        boton.innerText = "Calcular Precio Exacto";
    }
}

function generarFolio() {
    return 'SHM-' + Math.floor(1000 + Math.random() * 9000);
}

// Envía la cotización aprobada desde el mostrador directo a la hoja "DB_github"
async function enviarCotizacionAprobada() {
    if (!partidaActualCotizada) {
        alert("Primero debes calcular el precio.");
        return;
    }

    const cliente = document.getElementById('clienteNombre').value.trim();
    const nombrePieza = document.getElementById('nombreProyecto').value.trim();
    const placaSelec = document.getElementById('selPlaca') ? document.getElementById('selPlaca').value : "PEI Texturizada";
    const colorSelec = document.getElementById('selColor') ? document.getElementById('selColor').value : "PLA Estándar";
    
    // El punto de entrega (Oficina o Casa) y método de pago, si ya se seleccionan en index
    const puntoEntrega = document.getElementById('selEntrega') ? document.getElementById('selEntrega').value : "🏢 Oficina";
    const metodoPago = document.getElementById('selMetodoPago') ? document.getElementById('selMetodoPago').value : "Pendiente";
    const estatusPago = metodoPago !== "Pendiente" ? "🟢 Pagado" : "🔴 Pendiente";

    if (!cliente || !nombrePieza) {
        alert("Por favor escribe el nombre del cliente y de la pieza.");
        return;
    }

    const btn = document.getElementById('btnAprobar');
    btn.disabled = true;
    btn.innerText = "Registrando y Notificando...";

    const ahora = new Date();
    const mes = `${ahora.getFullYear()}-${String(ahora.getMonth()+1).padStart(2,'0')}`;
    const fechaTimestamp = `${mes}-${String(ahora.getDate()).padStart(2,'0')} ${String(ahora.getHours()).padStart(2,'0')}:${String(ahora.getMinutes()).padStart(2,'0')}`;
    const nuevoFolio = generarFolio();
    
    // Ensamble del nombre descriptivo
    const productoDetalle = `[${partidaActualCotizada.Q}x ${nombrePieza} (${placaSelec}) · ${colorSelec}]`;

    const payload = {
        tipo: 'NUEVA_COTIZACION',
        datos: {
            id: nuevoFolio,
            mes: mes,
            fecha: fechaTimestamp,
            cliente: cliente,
            contacto: puntoEntrega, 
            producto: productoDetalle,
            Q: partidaActualCotizada.Q,
            gramos: partidaActualCotizada.gramosTotales,
            minutos: partidaActualCotizada.minutosTotales,
            total: partidaActualCotizada.total,
            tipoNegocio: calculoActual.tipoNegocio,
            estatus_pago: estatusPago,
            metodo_pago: metodoPago
        }
    };

    try {
        const respuesta = await fetch(WEB_APP_URL, {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' }
        });
        
        const data = await respuesta.json();
        
        if (data.status === 'success') {
            alert(`¡Pedido ${nuevoFolio} registrado!\n\nSe acaba de enviar la alerta a Telegram para su producción.`);
            limpiarFormularioCotizador();
        } else {
            alert("Error del servidor: " + (data.mensaje || data.error));
        }
    } catch (e) {
        alert("Error de conexión al enviar el registro a Sheets/Telegram.");
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerText = "✅ Aprobar Cotización y Enviar a Taller";
    }
}

function limpiarFormularioCotizador() {
    document.getElementById('pesoGramos').value = "";
    document.getElementById('tiempoHoras').value = "";
    document.getElementById('tiempoMinutos').value = "";
    document.getElementById('cantidadPiezas').value = "1";
    document.getElementById('clienteNombre').value = "";
    document.getElementById('nombreProyecto').value = "";
    
    document.getElementById('areaResultados').classList.add('hidden');
    partidaActualCotizada = null;
    seleccionarTipoNegocio('venta_directa');
}
