const reserva = require("../modelos/reserva");

const crearServicioReserva = () => {
  const listar = async (sala) =>
    sala ? reserva.find({ sala }) : reserva.find({});

  const buscarPorId = async (id) => {
    const resultados = await reserva.find({ _id: id });
    return resultados[0];
  };

  const obtenerCantidad = async () => (await reserva.find({})).length;

  const crear = async (datos) => reserva.create(datos);

  const actualizarPorId = async (id, datos) =>
    reserva.findByIdAndUpdate(id, datos, {
      new: true,
      runValidators: true,
      upsert: false,
    });

  const eliminarPorId = async (id) => reserva.findByIdAndDelete(id);

  return {
    listar,
    buscarPorId,
    obtenerCantidad,
    crear,
    actualizarPorId,
    eliminarPorId,
  };
};

module.exports = { crearServicioReserva };
