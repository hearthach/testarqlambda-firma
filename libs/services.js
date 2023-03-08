/* Para Services */

import "dotenv/config";
import fetch from "node-fetch";

import { initDB } from "./db.js";

const TABLE_NAME = "control_proceso_pdf";

async function updateRowControlTableNotified(envelopeExternalId, pdf) {
  try {
    let q = `UPDATE ${TABLE_NAME} SET notificadoFlag = 1 WHERE envelopeExternalId = ? AND adjunto = ?`;
    const [result] = await initDB.query(q, [envelopeExternalId, pdf]);

    return result;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function getByIdRowPdf(envelopeExternalId, pdf) {
  try {
    let q = `SELECT * FROM ${TABLE_NAME} WHERE envelopeExternalId = ? AND adjunto = ?`;
    const [row] = await initDB.query(q, [envelopeExternalId, pdf]);

    return row;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function fetchApi(url, body, headers) {
  const options = {
    method: "POST",
    body: JSON.stringify(body),
    headers,
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    return data;
  } catch (err) {
    throw err;
  }
}

async function getToken(body, headers) {
  try {
    const url = process.env["ENOTRIA_URL_GET_TOKEN"];
    const data = await fetchApi(url, body, headers);
    const res = data?.payload?.response;
    if (res?.errorType === "Exception") throw data.errorMessage;
    return res?.token;
  } catch (err) {
    throw err;
  }
}

async function generateETX(body, headers) {
  try {
    const url = process.env["ENOTRIA_GENERATE_ETX"];
    const data = await fetchApi(url, body, headers);

    const msgError = data?.error?.message;
    if (msgError === "Error") throw data.error.details;
    return data;
  } catch (err) {
    throw err;
  }
}

export { getByIdRowPdf, updateRowControlTableNotified, getToken, generateETX };