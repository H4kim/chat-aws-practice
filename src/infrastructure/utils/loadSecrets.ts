import { SSMClient, GetParametersByPathCommand } from "@aws-sdk/client-ssm";

const PARAMETER_PATH = "/chatApp/";

const loadSecrets = async (): Promise<void> => {
   const client = new SSMClient({ region: "us-east-1" });

   const paramsRequest = {
      Path: PARAMETER_PATH,
      Recursive: true,
      WithDecryption: true
   };

   try {
      const response = await client.send(new GetParametersByPathCommand(paramsRequest));
      if (!response.Parameters) {
         throw new Error("No parameters available on parameters store");
      }

      response.Parameters.forEach(param => {
         const paramName = param?.Name?.substring(param.Name.lastIndexOf("/") + 1);

         if (paramName) {
            process.env[paramName] = param.Value;
            console.log(`Loaded env variable: ${paramName}`);
         }
      });
   } catch (err: any) {
      console.log("ERROR while trying to load env variables", err);
      throw new Error(err);
   }
};

export default loadSecrets;
