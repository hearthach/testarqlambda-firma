import "dotenv/config";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "./libs/s3client.js";
import {
  getToken,
  generateETX,
  updateRowControlTableNotified,
} from "./libs/services.js";

import { buildBodyETX } from "./libs/utils.js";

export async function handler(event, context, callback) {
  // Obtener la clave del objeto S3 que ha desencadenado la función
  //const key = event.Records[0].s3.object.key;
  const { key } = event.Records[0].s3.object;

  console.log("Key: ->", key);

  // Configurar los parámetros de S3 para obtener el objeto JSON
  const bucketName = "eno-s3-dev-firma-digital-certificada";
  const bucketParams = { Bucket: bucketName, Key: key };

  try {
    // Obtener el objeto JSON de S3
    const getObjectCommand = new GetObjectCommand(bucketParams);
    const readJson = await s3Client.send(getObjectCommand);
    const bodyJson = await readJson.Body.transformToString();
    const dJson = JSON.parse(bodyJson);

    // Imprimir algunas propiedades del objeto JSON
    console.log("envelopeExternalId: ---------------->", dJson.envelopeExternalId);
    console.log("documents:-----> ", dJson.documents);

    // Obtener un token de autenticación
    const bodyToken = { username: process.env["ENOTRIA_USER"], passwd: process.env["ENOTRIA_PASSWORD"] };
    const headersToken = { "Content-Type": "application/json" };
    const token = await getToken(bodyToken, headersToken);
    console.log("token---> ", JSON.stringify(token));

    // Configurar los encabezados para la solicitud de generación de ETX
    const headersETX = { "Content-Type": "application/json", Authorization: token };
    console.log("headersETX------------------ ", headersETX);

    // Iterar sobre cada documento en el objeto JSON y generar un ETX para cada uno
    for (const doc of dJson.documents) {
      console.log("doc------> ", doc.docExternalId);

      // Construir el cuerpo de la solicitud de generación de ETX
      const bodyETX = await buildBodyETX(dJson, doc);
      console.log("bodyETX------------------ ", bodyETX);

      // Generar el ETX para el documento actual
      const genETX = await generateETX(bodyETX, headersETX);
      console.log("generateETX ------> ", genETX);

      // Actualizar la tabla de control si se ha generado el ETX correctamente
      if (genETX?.message == "Forbidden") {
        console.log("Instant notification server error 😢🤦‍♂️");
      } else {
        const resUpdateNotified = await updateRowControlTableNotified(dJson.envelopeExternalId, doc.docExternalId);
        console.log("after updated:----------> ", resUpdateNotified);
      }
    }
  } catch (err) {
    console.log("Error -----------> ", err);
    throw new Error(err.message);
  }
}