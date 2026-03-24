// =============================================
// estudiantes.js — Controlador de la capa de Negocio
// Lógica para registrar, listar y vincular formatos
// =============================================

const estudianteModelo = require('../modelos/estudiante');

// Registra un nuevo estudiante
const registrar = async (req, res) => {
    try {
        const { cedula, nombre, carrera, periodo, correo, telefono } = req.body;

        // Validación básica de campos obligatorios
        if (!cedula || !nombre || !carrera || !periodo) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Cédula, nombre, carrera y periodo son obligatorios'
            });
        }

        const nuevoEstudiante = await estudianteModelo.crear({
            cedula, nombre, carrera, periodo, correo, telefono
        });

        res.json({ exito: true, datos: nuevoEstudiante });
    } catch (error) {
        // Error de cédula duplicada (código 23505 de PostgreSQL)
        if (error.code === '23505') {
            return res.status(400).json({ exito: false, mensaje: 'Ya existe un estudiante con esa cédula' });
        }
        console.error('Error al registrar estudiante:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Lista todos los estudiantes (con búsqueda opcional via query ?buscar=)
const listar = async (req, res) => {
    try {
        const busqueda = req.query.buscar || '';
        const estudiantes = await estudianteModelo.obtenerTodos(busqueda);
        res.json({ exito: true, datos: estudiantes });
    } catch (error) {
        console.error('Error al listar estudiantes:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al obtener estudiantes' });
    }
};

// Obtiene el detalle de un estudiante + sus formatos vinculados
const obtenerDetalle = async (req, res) => {
    try {
        const { id } = req.params;
        const estudiante = await estudianteModelo.obtenerPorId(id);

        if (!estudiante) {
            return res.status(404).json({ exito: false, mensaje: 'Estudiante no encontrado' });
        }

        // También traemos sus formatos vinculados
        const formatos = await estudianteModelo.obtenerFormatos(id);

        res.json({ exito: true, datos: { ...estudiante, formatos } });
    } catch (error) {
        console.error('Error al obtener detalle:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

// Vincula un formato a un estudiante
const vincularFormato = async (req, res) => {
    try {
        const { id } = req.params; // ID del estudiante
        const { formatoId, observacion } = req.body;

        if (!formatoId) {
            return res.status(400).json({ exito: false, mensaje: 'Debe seleccionar un formato' });
        }

        const asignacion = await estudianteModelo.vincularFormato(id, formatoId, observacion);
        res.json({ exito: true, datos: asignacion, mensaje: 'Formato vinculado correctamente' });
    } catch (error) {
        console.error('Error al vincular formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error al vincular formato' });
    }
};

// Desvincula un formato de un estudiante
const desvincularFormato = async (req, res) => {
    try {
        const { asignacionId } = req.params;
        const eliminado = await estudianteModelo.desvincularFormato(asignacionId);

        if (!eliminado) {
            return res.status(404).json({ exito: false, mensaje: 'Asignación no encontrada' });
        }

        res.json({ exito: true, mensaje: 'Formato desvinculado' });
    } catch (error) {
        console.error('Error al desvincular formato:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

module.exports = {
    registrar,
    listar,
    obtenerDetalle,
    vincularFormato,
    desvincularFormato
};
