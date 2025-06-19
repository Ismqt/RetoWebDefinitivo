const express = require('express');
const { sql, poolPromise } = require('../config/db');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/appointments - Get appointments based on user role
router.get('/', verifyToken, async (req, res) => {
    try {
        // Log the entire req.user object to see its structure and content
        console.log('[API APPOINTMENTS GET /] Full req.user object:', JSON.stringify(req.user, null, 2));

        const { id: userId, id_Rol, id_CentroVacunacion } = req.user;
        console.log(`[API APPOINTMENTS GET /] Extracted from req.user: userId=${userId}, id_Rol=${id_Rol}, id_CentroVacunacion=${id_CentroVacunacion} (Type of id_Rol: ${typeof id_Rol})`);

        const pool = await poolPromise;

        // Validate that id_Rol is a number and present
        if (typeof id_Rol !== 'number') {
            console.error(`[API APPOINTMENTS GET /] Error: id_Rol is not a number or is missing. Value: ${id_Rol}, Type: ${typeof id_Rol}`);
            return res.status(401).send({ message: 'Unauthorized: Role ID is invalid or not found in token.' });
        }

        let result;
        
        // For Personal del Centro de Vacunación (role 6), get all appointments by center
        if (id_Rol === 6) {
            if (!id_CentroVacunacion) {
                console.error(`[API APPOINTMENTS GET /] Error: id_CentroVacunacion is missing for role 6 user.`);
                return res.status(400).send({ message: 'Bad Request: Center ID is required for center staff.' });
            }
            
            console.log(`[API APPOINTMENTS GET /] Calling usp_GetAppointmentsByCenter with id_CentroVacunacion: ${id_CentroVacunacion}`);
            
            result = await pool.request()
                .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
                .execute('usp_GetAppointmentsByCenter');
        } else {
            // For other roles, use the original stored procedure
            console.log(`[API APPOINTMENTS GET /] Calling usp_GetAllAppointments with id_Usuario: ${userId}, id_Rol: ${id_Rol}`);

            result = await pool.request()
                .input('id_Usuario', sql.Int, userId)
                .input('id_Rol', sql.Int, id_Rol)
                .execute('usp_GetAllAppointments');
        }

        res.json(result.recordset);

    } catch (err) {
        // Log more context from req.user in case of an error
        const userIdFromErrorCtx = req.user ? req.user.id : 'N/A';
        const userRolIdFromErrorCtx = req.user ? req.user.id_Rol : 'N/A';
        console.error(`[API APPOINTMENTS GET /] SQL error. UserID=${userIdFromErrorCtx}, UserRoleID=${userRolIdFromErrorCtx}. Error:`, err);
        res.status(500).send({ message: 'Failed to retrieve appointments.', error: err.message });
    }
});

// POST /api/appointments - Create a new appointment
router.post('/', verifyToken, async (req, res) => {
    console.log('Received payload for new appointment:', req.body);
    try {
        const { id: id_Usuario } = req.user; // Get user ID from token
        console.log(`[APPOINTMENTS ROUTE] Extracted id_Usuario from token: ${id_Usuario} (Type: ${typeof id_Usuario})`);
        const {
            id_Nino,
            id_CentroVacunacion,
            id_Vacuna,
            Fecha,
            Hora
        } = req.body;

        // Basic validation using the correct variable names
        if (!id_CentroVacunacion || !id_Vacuna || !Fecha || !Hora) {
            // Log which specific field is causing the validation to fail
            if (!id_CentroVacunacion) console.error('[VALIDATION FAIL] id_CentroVacunacion is missing or invalid:', id_CentroVacunacion);
            if (!id_Vacuna) console.error('[VALIDATION FAIL] id_Vacuna is missing or invalid:', id_Vacuna);
            if (!Fecha) console.error('[VALIDATION FAIL] Fecha is missing or invalid:', Fecha);
            if (!Hora) console.error('[VALIDATION FAIL] Hora is missing or invalid:', Hora);
            return res.status(400).json({ message: 'Faltan campos requeridos para la cita.' });
        }

        // Format Hora to ensure it's in HH:MM:SS format for SQL Server TIME type
        let formattedHora = Hora;
        if (Hora && typeof Hora === 'string') {
            // If hora is in HH:MM format, convert to HH:MM:SS
            if (Hora.match(/^\d{2}:\d{2}$/)) {
                formattedHora = Hora + ':00';
            }
        }
        console.log(`[APPOINTMENTS ROUTE] Formatted Hora: '${Hora}' -> '${formattedHora}'`);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Usuario', sql.Int, id_Usuario)
            .input('id_Nino', sql.Int, id_Nino || null)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.VarChar(8), formattedHora)
            .execute('usp_CreateAppointment');

        res.status(201).send({ message: 'Cita creada exitosamente.', data: result.recordset });

    } catch (err) {
        console.error('API Error on POST /api/appointments:', err);
        // Check if the error is a SQL error for constraint violation or similar
        if (err.originalError && err.originalError.info) {
            // Log the detailed SQL error
            console.error('SQL Server Error Info:', err.originalError.info);
            // Send a more specific error message if possible, or a generic one
            res.status(400).json({ 
                message: 'Error de base de datos al crear la cita.', 
                error: err.originalError.info.message || 'Error de validación de datos o restricción.' 
            });
        } else if (err.message.includes('Validation failed')) {
            res.status(400).json({ message: 'Error al crear la cita.', error: err.message });
        } else {
            res.status(500).json({ message: 'Error interno del servidor al crear la cita.', error: err.message });
        }
    }
});

// PUT /:id - Update an existing appointment
router.put('/:id', [verifyToken, checkRole([1, 4])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_Vacuna, id_CentroVacunacion, Fecha, Hora, id_EstadoCita } = req.body;
        
        // Format Hora to ensure it's in HH:MM:SS format
        let formattedHora = Hora;
        if (Hora && typeof Hora === 'string') {
            if (Hora.match(/^\d{2}:\d{2}$/)) {
                formattedHora = Hora + ':00';
            }
        }
        
        const pool = await poolPromise;

        await pool.request()
            .input('id_Cita', sql.Int, id)
            .input('id_Vacuna', sql.Int, id_Vacuna)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.VarChar(8), formattedHora)
            .input('id_EstadoCita', sql.Int, id_EstadoCita)
            .execute('usp_UpdateAppointment');

        res.status(200).send({ message: 'Appointment updated successfully.' });
    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:id:', err);
        res.status(500).send({ message: 'Failed to update appointment.', error: err.message });
    }
});

// PUT /api/appointments/:id/edit - Edit appointment details (Personal del Centro only)
router.put('/:id/edit', [verifyToken, checkRole([6])], async (req, res) => {
    try {
        const { id } = req.params;
        const { Fecha, Hora, id_PersonalSalud } = req.body;

        console.log(`[API PUT /:id/edit] Editing appointment ${id}:`, { Fecha, Hora, id_PersonalSalud });

        // Validate required fields
        if (!Fecha || !Hora) {
            return res.status(400).json({ message: 'Fecha y Hora son campos requeridos.' });
        }

        // Validate time format
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeRegex.test(Hora)) {
            console.error(`[API PUT /:id/edit] Invalid time format: ${Hora}`);
            return res.status(400).json({ message: 'Formato de hora inválido. Use HH:MM (ej: 14:30)' });
        }

        // Format Hora to ensure it's in HH:MM:SS format
        let formattedHora = Hora;
        if (Hora && typeof Hora === 'string') {
            if (Hora.match(/^\d{2}:\d{2}$/)) {
                formattedHora = Hora + ':00';
            }
            // Handle single digit hours
            if (Hora.match(/^\d{1}:\d{2}$/)) {
                formattedHora = '0' + Hora + ':00';
            }
        }

        console.log(`[API PUT /:id/edit] Time formatting: '${Hora}' -> '${formattedHora}'`);

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Cita', sql.Int, parseInt(id))
            .input('Fecha', sql.Date, Fecha)
            .input('Hora', sql.VarChar(8), formattedHora) // USAR VARCHAR EN LUGAR DE TIME
            .input('id_PersonalSalud', sql.Int, id_PersonalSalud || null)
            .execute('usp_EditAppointment');

        console.log(`[API PUT /:id/edit] Successfully edited appointment ${id}`);
        res.status(200).json({ 
            message: 'Cita actualizada exitosamente.',
            data: result.recordset[0] 
        });

    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:id/edit:', err);
        
        const dbErrorMessage = err.originalError ? err.originalError.message : 'Error al actualizar la cita.';
        
        if (dbErrorMessage.includes('Solo se pueden editar citas') || 
            dbErrorMessage.includes('no existe') || 
            dbErrorMessage.includes('no está activo') ||
            dbErrorMessage.includes('No se pueden editar citas que ya han sido asistidas')) {
            res.status(400).json({ message: dbErrorMessage });
        } else {
            res.status(500).json({ 
                message: 'Error al actualizar la cita.', 
                error: dbErrorMessage 
            });
        }
    }
});

// POST /api/appointments/:id/record - Record a vaccination
router.post('/:id/record', [verifyToken, checkRole([1, 6])], async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            id_PersonalSalud_Usuario, 
            id_LoteAplicado, 
            NombreCompletoPersonalAplicado, 
            DosisAplicada, 
            EdadAlMomento, 
            NotasAdicionales, 
            Alergias 
        } = req.body;

        const pool = await poolPromise;
        const request = pool.request()
            .input('id_Cita', sql.Int, id)
            .input('id_PersonalSalud_Usuario', sql.Int, id_PersonalSalud_Usuario)
            .input('id_LoteAplicado', sql.Int, id_LoteAplicado)
            .input('NombreCompletoPersonalAplicado', sql.NVarChar(100), NombreCompletoPersonalAplicado)
            .input('DosisAplicada', sql.NVarChar(50), DosisAplicada)
            .input('EdadAlMomento', sql.NVarChar(20), EdadAlMomento)
            .input('NotasAdicionales', sql.NVarChar(sql.MAX), NotasAdicionales)
            .input('Alergias', sql.NVarChar(sql.MAX), Alergias)
            .output('OutputMessage', sql.NVarChar(255));

        await request.execute('usp_RecordVaccination');

        const outputMessage = request.parameters.OutputMessage.value;
        res.status(200).send({ message: outputMessage });

    } catch (err) {
        console.error('SQL error on POST /api/appointments/:id/record:', err);
        res.status(500).send({ message: 'Failed to record vaccination.', error: err.message });
    }
});

// GET /api/appointments/medicos - Get doctors for the current user's vaccination center (Personal del Centro only)
router.get('/medicos', [verifyToken, checkRole([6])], async (req, res) => {
    try {
        const { id_CentroVacunacion } = req.user;
        console.log(`[API GET /medicos] Getting doctors for center: ${id_CentroVacunacion}`);

        if (!id_CentroVacunacion) {
            return res.status(400).json({ message: 'No se encontró el centro de vacunación asignado al usuario.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .execute('usp_GetMedicosByCentro');

        console.log(`[API GET /medicos] Found ${result.recordset.length} doctors for center ${id_CentroVacunacion}`);
        res.json(result.recordset);

    } catch (err) {
        console.error('SQL error on GET /api/appointments/medicos:', err);
        res.status(500).json({ message: 'Error al obtener los médicos del centro.', error: err.message });
    }
});

// PUT /api/appointments/:id/assign-medico - Assign a doctor to an appointment (Personal del Centro only)
router.put('/:id/assign-medico', [verifyToken, checkRole([6])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_PersonalSalud } = req.body;
        const { id_CentroVacunacion } = req.user;

        console.log(`[API PUT /:id/assign-medico] Assigning doctor ${id_PersonalSalud} to appointment ${id} for center ${id_CentroVacunacion}`);

        if (!id_PersonalSalud) {
            return res.status(400).json({ message: 'Debe especificar el ID del médico a asignar.' });
        }

        if (!id_CentroVacunacion) {
            return res.status(400).json({ message: 'No se encontró el centro de vacunación asignado al usuario.' });
        }

        const pool = await poolPromise;
        const request = pool.request()
            .input('id_Cita', sql.Int, parseInt(id))
            .input('id_PersonalSalud', sql.Int, id_PersonalSalud)
            .input('id_CentroVacunacion', sql.Int, id_CentroVacunacion)
            .output('OutputMessage', sql.NVarChar(255))
            .output('Success', sql.Bit);

        const result = await request.execute('usp_AssignMedicoToCita');

        const outputMessage = result.output?.OutputMessage;
        const success = result.output?.Success;

        console.log(`[API PUT /:id/assign-medico] SP Result - Success: ${success}, Message: ${outputMessage}`);

        if (success) {
            console.log(`[API PUT /:id/assign-medico] Successfully assigned doctor: ${outputMessage}`);
            res.status(200).json({ message: outputMessage });
        } else {
            console.log(`[API PUT /:id/assign-medico] Failed to assign doctor: ${outputMessage}`);
            res.status(400).json({ message: outputMessage });
        }

    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:id/assign-medico:', err);
        
        // Better error handling
        const errorMessage = err.originalError ? err.originalError.message : err.message;
        res.status(500).json({ 
            message: 'Error al asignar el médico a la cita.', 
            error: errorMessage 
        });
    }
});

// PUT /api/appointments/:id/confirm - Confirm an appointment (Personal del Centro only)
router.put('/:id/confirm', [verifyToken, checkRole([6])], async (req, res) => {
    try {
        const { id } = req.params;
        const { id_PersonalSalud } = req.body;
        const { id_CentroVacunacion } = req.user;

        console.log(`[API PUT /:id/confirm] Confirming appointment ${id} with doctor ${id_PersonalSalud} for center ${id_CentroVacunacion}`);

        // Validate required fields
        if (!id_PersonalSalud) {
            return res.status(400).json({ message: 'Debe especificar el ID del médico para confirmar la cita.' });
        }

        if (!id_CentroVacunacion) {
            return res.status(400).json({ message: 'No se encontró el centro de vacunación asignado al usuario.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id_Cita', sql.Int, parseInt(id))
            .input('id_PersonalSalud', sql.Int, id_PersonalSalud)
            .execute('usp_ConfirmAppointment');

        console.log(`[API PUT /:id/confirm] Successfully confirmed appointment ${id}`);
        res.status(200).json({ 
            message: 'Cita confirmada exitosamente.',
            data: result.recordset[0] 
        });

    } catch (err) {
        console.error('SQL error on PUT /api/appointments/:id/confirm:', err);
        
        // Handle specific database errors
        const dbErrorMessage = err.originalError ? err.originalError.message : 'Error al confirmar la cita.';
        
        // Check if it's a validation error from the stored procedure
        if (dbErrorMessage.includes('Solo se pueden confirmar citas') || 
            dbErrorMessage.includes('no existe') || 
            dbErrorMessage.includes('no tiene el rol correcto')) {
            res.status(400).json({ message: dbErrorMessage });
        } else {
            res.status(500).json({ 
                message: 'Error al confirmar la cita.', 
                error: dbErrorMessage 
            });
        }
    }
});

module.exports = router;