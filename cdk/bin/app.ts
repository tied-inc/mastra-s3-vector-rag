import * as cdk from "aws-cdk-lib";
import { MastraStack } from "../lib/mastra-stack";

const app = new cdk.App();

new MastraStack(app, "MastraS3VectorRagStack", {
  /* Inject env to target a specific account/region */
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
  // Pass runtime environment values into the stack so it can forward to Lambda
  nodeEnv: process.env.NODE_ENV ?? "production",
  mastraJwtSecret: process.env.MASTRA_JWT_SECRET ?? "test-mastra-secret",
  s3VectorsBucketArn: process.env.S3_VECTORS_BUCKET_ARN,
  s3VectorsBucketName: process.env.S3_VECTORS_BUCKET_NAME,
});
