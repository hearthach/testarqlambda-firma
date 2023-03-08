/* UTIL */

import { getByIdRowPdf } from "./services.js";

async function buildBodyETX(dJson, doc) {
  const [getIdRow] = await getByIdRowPdf(dJson.envelopeExternalId, doc.docExternalId);

  const { NOMBRES: value, correo: to } = JSON.parse(getIdRow.tramaContent);

  const dataRegister = [
    {
      key: "MAIL",
      value: "zapata@enotriasa.com",
    },
    {
      key: "NOMBRE",
      value,
    },
  ];

  const bodyETX = {
    productId: 4594,
    dataRegister,
    channel: "ETX",
    attached: doc.content.data,
    to,
  };

  return bodyETX;
}

export { buildBodyETX };
