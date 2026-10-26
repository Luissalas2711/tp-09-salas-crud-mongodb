const { salasPermitidas } = require("../middleware/reservas");

const crearControladorReservas = (servicio) => {
  const listarReservas = async (req, res) => {
    res.render("reservas/lista", {
      titulo: "Listado de Reservas",
      reservas: await servicio.listar(),
    });
  };

  const listarApi = async (req, res) => {
    try {
      const sala = req.query.sala;

      if (sala !== undefined && typeof sala !== "string") {
        return res
          .status(400)
          .json({ error: "El parámetro sala no puede repetirse" });
      }

      const reservas = await servicio.listar(sala);
      res.status(200).json(reservas);
    } catch {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  const obtenerApiPorId = async (req, res) => {
    const id = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    try {
      const reserva = await servicio.buscarPorId(id);

      if (!reserva) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      return res.status(200).json(reserva);
    } catch {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  const crearApi = async (req, res) => {
    try {
      const reserva = await servicio.crear(req.reservaValidada);

      return res
        .status(201)
        .location(`/api/reservas/${reserva._id}`)
        .json(reserva);
    } catch {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  const actualizarApi = async (req, res) => {
    const id = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "ID invalido" });
    }

    try {
      const reservaActualizada = await servicio.actualizarPorId(
        id,
        req.camposActualizacion,
      );

      if (!reservaActualizada) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      return res.status(200).json(reservaActualizada);
    } catch (error) {
      if (error.name === "ValidationError") {
        return res
          .status(400)
          .json({ error: "Los datos de la reserva no son válidos" });
      }

      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  const eliminarApi = async (req, res) => {
    const id = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    try {
      const reservaEliminada = await servicio.eliminarPorId(id);

      if (!reservaEliminada) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      return res.status(204).end();
    } catch {
      return res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  const formularioNuevaReserva = (req, res) => {
    res.render("reservas/nueva", {
      titulo: "Nueva Reserva",
      salasPermitidas,
      errores: [],
      valores: {},
    });
  };

  const obtenerReservaPorId = async (req, res) => {
    const id = req.params.id;
    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: `No se encontró la reserva con ID ${req.params.id}`,
      });
    }

    res.render("reservas/detalle", { titulo: "Detalle de Reserva", reserva });
  };

  const crearReserva = async (req, res) => {
    await servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  };

  const obtenerEstado = async (req, res) => {
    res.json({
      servicio: "activo",
      reservas: await servicio.obtenerCantidad(),
      solicitudId: res.locals.solicitudId,
    });
  };

  return {
    listarReservas,
    formularioNuevaReserva,
    obtenerReservaPorId,
    crearReserva,
    obtenerEstado,
    listarApi,
    obtenerApiPorId,
    crearApi,
    actualizarApi,
    eliminarApi,
  };
};

module.exports = { crearControladorReservas };
