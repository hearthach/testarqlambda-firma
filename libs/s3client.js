/* Para s3 */

import {
    S3Client,
    GetObjectCommand,
    PutObjectCommand,
  } from "@aws-sdk/client-s3";
  
  function getS3Client() {
    const region = process.env.ENOTRIA_AWS_REGION;
    const s3Client = new S3Client({ region });
  
    return {
      getClient: () => s3Client,
      getObject: async (params) => {
        const command = new GetObjectCommand(params);
        return await s3Client.send(command);
      },
      putObject: async (params) => {
        const command = new PutObjectCommand(params);
        return await s3Client.send(command);
      },
    };
  }
  
  export default getS3Client;
  