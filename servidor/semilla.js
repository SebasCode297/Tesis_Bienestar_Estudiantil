// =============================================
// semilla.js — Script para inicializar la base de datos
// Crea la tabla 'usuarios' e inserta el usuario admin
// de Bienestar Estudiantil.
// Ejecutar UNA sola vez: node semilla.js
// =============================================

require('dotenv').config();
const { Pool }  = require('pg');
const bcrypt    = require('bcryptjs');

// Crea la conexión al servidor de PostgreSQL
const pool = new Pool({
    host:     process.env.DB_HOST,
    port:     process.env.DB_PUERTO,
    user:     process.env.DB_USUARIO,
    password: process.env.DB_CONTRASENA,
    database: process.env.DB_NOMBRE,
});

// Función principal asíncrona
const inicializarBaseDatos = async () => {
    console.log('🔄 Iniciando configuración de la base de datos...\n');

    try {
        // ---- PASO 1: Crear la tabla usuarios ----
        await pool.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id          SERIAL PRIMARY KEY,
                correo      VARCHAR(150) UNIQUE NOT NULL,
                contrasena  VARCHAR(255) NOT NULL,
                rol         VARCHAR(50) NOT NULL,
                activo      BOOLEAN DEFAULT TRUE,
                creado_en   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "usuarios" creada o ya existía.');

        // ---- PASO 1.5: Crear la tabla formatos ----
        await pool.query(`
            CREATE TABLE IF NOT EXISTS formatos (
                id             SERIAL PRIMARY KEY,
                nombre         VARCHAR(200) UNIQUE NOT NULL,
                modulo         VARCHAR(50) NOT NULL,
                archivo_nombre VARCHAR(255),
                archivo_ruta   VARCHAR(500),
                subido_en      TIMESTAMP
            )
        `);
        console.log('✅ Tabla "formatos" creada o ya existía.');

        // ---- PASO 1.6: Crear la tabla estudiantes ----
        await pool.query(`
            CREATE TABLE IF NOT EXISTS estudiantes (
                id        SERIAL PRIMARY KEY,
                cedula    VARCHAR(15) UNIQUE NOT NULL,
                nombre    VARCHAR(150) NOT NULL,
                carrera   VARCHAR(100) NOT NULL,
                periodo   VARCHAR(50) NOT NULL,
                correo    VARCHAR(150),
                telefono  VARCHAR(20),
                creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "estudiantes" creada o ya existía.');

        // ---- PASO 1.7: Crear la tabla estudiante_formatos ----
        // Vincula un formato específico a un estudiante
        await pool.query(`
            CREATE TABLE IF NOT EXISTS estudiante_formatos (
                id             SERIAL PRIMARY KEY,
                estudiante_id  INTEGER REFERENCES estudiantes(id) ON DELETE CASCADE,
                formato_id     INTEGER REFERENCES formatos(id) ON DELETE CASCADE,
                observacion    TEXT,
                asignado_en    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✅ Tabla "estudiante_formatos" creada o ya existía.');

        // ---- PASO 2: Hashear la contraseña con bcrypt ----
        // 10 rondas de sal — balance entre seguridad y velocidad
        const contrasenaHasheada = await bcrypt.hash('123456', 10);
        console.log('✅ Contraseña hasheada correctamente.');

        // ---- PASO 3: Insertar el usuario admin de Bienestar ----
        // ON CONFLICT DO NOTHING evita error si ya existe
        await pool.query(`
            INSERT INTO usuarios (correo, contrasena, rol, activo)
            VALUES ($1, $2, $3, TRUE)
            ON CONFLICT (correo) DO NOTHING
        `, [
            'bienestar.estudiantil.istpet.edu.ec',
            contrasenaHasheada,
            'bienestar'
        ]);
        console.log('✅ Usuario de Bienestar Estudiantil verificado.');

        // ---- PASO 4: Insertar los 15 formatos iniciales ----
        const formatos = [
            // Módulo Beca
            { nombre: 'ANEXO 1 - OFICIO', modulo: 'beca' },
            { nombre: 'ANEXO 2 - SOLICITUD', modulo: 'beca' },
            { nombre: 'FICHA SOCIOECONÓMICA', modulo: 'beca' },
            // Módulo Seguimiento y Acompañamiento
            { nombre: 'ACTA DE REUNIÓN U.B.I.', modulo: 'seguimiento' },
            { nombre: 'FICHA ACUERDO-COMPROMISO', modulo: 'seguimiento' },
            { nombre: 'FICHA DE ACOMPAÑAMIENTO - Formato', modulo: 'seguimiento' },
            { nombre: 'FICHA DE JUSTIFICACIÓN DE FALTAS', modulo: 'seguimiento' },
            { nombre: 'FORMATO - FICHA DE SOLICITUD DE ATENCIÓN', modulo: 'seguimiento' },
            { nombre: 'FORMATO - INFORME DE SEGUIMIENTO DE ACOMPAÑAMIENTO Y CONTROL PEDAGÓGICO-DOCENTES', modulo: 'seguimiento' },
            { nombre: 'FORMATOS', modulo: 'seguimiento' },
            { nombre: 'INFORME DE BIENESTAR ESTUDIANTIL', modulo: 'seguimiento' },
            { nombre: 'INFORME DE CIERRE DEL PROCESO DE ACOMPAÑAMIENTO', modulo: 'seguimiento' },
            { nombre: 'REGISTRO DE ATENCIÓN A ESTUDIANTES', modulo: 'seguimiento' },
            { nombre: 'REGISTRO DE DESERCIÓN', modulo: 'seguimiento' },
            { nombre: 'SOLICITUD ESTUDIANTE-CONVENIO', modulo: 'seguimiento' }
        ];

        let insertados = 0;
        for (const f of formatos) {
            const res = await pool.query(`
                INSERT INTO formatos (nombre, modulo) 
                VALUES ($1, $2) 
                ON CONFLICT (nombre) DO NOTHING
            `, [f.nombre, f.modulo]);
            if (res.rowCount > 0) insertados++;
        }
        console.log(`✅ Formatos verificados en BD (insertados nuevos: ${insertados}).`);
        console.log('\n🎉 Base de datos inicializada correctamente.');
        console.log('   Correo: bienestar.estudiantil.istpet.edu.ec');
        console.log('   Rol:    bienestar\n');

    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
    } finally {
        // Cierra la conexión al terminar
        await pool.end();
    }
};

// Ejecuta la función principal
inicializarBaseDatos();
