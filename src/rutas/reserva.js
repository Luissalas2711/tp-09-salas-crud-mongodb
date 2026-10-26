const express = require("express");
const { asignarSeccion, validarReserva } = require("../middleware/reservas");

const crearRouterReservas = (controladorReservas) => {
  const router = express.Router();

  router.use(asignarSeccion);
  router.get("/", controladorReservas.listarReservas);
  router.get("/nueva", controladorReservas.formularioNuevaReserva);
  router.get("/:id", controladorReservas.obtenerReservaPorId);
  router.post("/", validarReserva, controladorReservas.crearReserva);

  return router;
};

module.exports = { crearRouterReservas };
