const WatchedSymbol = require("../../models/watchedSymbols");

const response = require("../../helpers/server-response");

exports.createWatchedSymbol = async (req, res) => {
  try {
    const watchedSymbol = await new WatchedSymbol().create(req.body);

    return response.Ok(
      res,
      "Watched Symbol successfully created",
      watchedSymbol
    );
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getWatchedSymbol = async (req, res) => {
  try {
    const id = req.params.id;
    const watchedSymbol = await new WatchedSymbol().findOne({ id });

    return response.Ok(res, "Watched Symbol successfully found", watchedSymbol);
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.getWatchedSymbols = async (req, res) => {
  try {
    const watchedSymbols = await new WatchedSymbol().find(req.query);

    return response.Ok(
      res,
      "Watched Symbols successfully found",
      watchedSymbols
    );
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.updateWatchedSymbol = async (req, res) => {
  try {
    const id = req.params.id;
    const watchedSymbol = await new WatchedSymbol(id).update(req.body);

    return response.Ok(
      res,
      "Watched Symbol successfully updated",
      watchedSymbol
    );
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};

exports.deleteWatchedSymbol = async (req, res) => {
  try {
    const id = req.params.id;
    const watchedSymbol = await new WatchedSymbol(id).update({
      is_deleted: true
    });

    return response.Ok(
      res,
      "Watched Symbol successfully deleted",
      watchedSymbol
    );
  } catch (err) {
    console.error(err.message);
    return response.InternalServerError(res, err.message);
  }
};
