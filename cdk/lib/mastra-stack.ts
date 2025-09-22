import * as path from "node:path";
import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  type StackProps,
} from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { FunctionUrlAuthType } from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import type { Construct } from "constructs";

export interface MastraStackProps extends StackProps {
  /** Value for process.env.NODE_ENV inside the Lambda */
  nodeEnv?: string;
  /** Value for process.env.MASTRA_JWT_SECRET inside the Lambda */
  mastraJwtSecret?: string;
  /** ARN of the S3 Vectors bucket (arn:aws:s3vectors:region:account:bucket/<name>) */
  s3VectorsBucketArn?: string;
}

export class MastraStack extends Stack {
  constructor(scope: Construct, id: string, props?: MastraStackProps) {
    super(scope, id, props);

    // S3 Vectors bucket is not managed here; pass its ARN via stack props/env
    const vectorBucketArn = props?.s3VectorsBucketArn;
    if (!vectorBucketArn) {
      throw new Error(
        "s3VectorsBucketArn is required (ARN like arn:aws:s3vectors:region:account:bucket/<name>)",
      );
    }

    // Lambda from Dockerfile at repo root
    // When running via ts-node, __dirname is cdk/lib → go two levels up to project root
    const repoRoot = path.resolve(__dirname, "..", "..");

    const appFunction = new lambda.DockerImageFunction(this, "AppFunction", {
      code: lambda.DockerImageCode.fromImageAsset(repoRoot, {
        file: "Dockerfile",
        exclude: [
          "cdk",
          ".git",
          ".github",
          "cdk.out",
          "dist",
          ".vscode",
          ".idea",
          ".DS_Store",
          "README.md",
          "CHANGELOG.md",
          "LICENSE",
          "test",
          "tests",
          "**/.cache/**",
          "**/.turbo/**",
          "**/.next/**",
          "**/.pnpm-store/**",
        ],
        // If your image must run on x86_64 explicitly, uncomment the next line
        // platform: Platform.LINUX_AMD64,
      }),
      memorySize: 1024,
      timeout: Duration.seconds(30),
      environment: {
        // Provide S3 Vectors bucket ARN (runtime will derive name if needed)
        S3_VECTORS_BUCKET_ARN: vectorBucketArn,
        NODE_ENV: props?.nodeEnv ?? "production",
        // Provide JWT secret via stack props (set before `cdk deploy`)
        MASTRA_JWT_SECRET: props?.mastraJwtSecret ?? "",
      },
    });

    // Permissions
    storageTable.grantReadWriteData(appFunction);

    // Attach S3 Vectors permissions directly to the Lambda role
    // Build resource ARNs for index-level and bucket-level operations
    const indexResources = [`${vectorBucketArn}/index/*`];
    const bucketResources = [vectorBucketArn];

    // Allow index lifecycle and vector CRUD/query operations required by the app
    appFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          // Index ops used by ensureIndex
          "s3vectors:CreateIndex",
          "s3vectors:GetIndex",
          "s3vectors:ListIndexes",
          // Vector CRUD and query
          "s3vectors:PutVectors",
          "s3vectors:GetVectors",
          "s3vectors:DeleteVectors",
          "s3vectors:QueryVectors",
          // Optional list vectors
          "s3vectors:ListVectors",
        ],
        resources: [...indexResources, ...bucketResources],
      }),
    );

    // Function URL (public, with permissive CORS suitable for dev)
    const fnUrl = appFunction.addFunctionUrl({
      authType: FunctionUrlAuthType.NONE,
      cors: {
        allowedOrigins: ["*"],
        allowedMethods: [
          lambda.HttpMethod.GET,
          lambda.HttpMethod.POST,
          lambda.HttpMethod.PUT,
          lambda.HttpMethod.PATCH,
          lambda.HttpMethod.DELETE,
          lambda.HttpMethod.HEAD,
        ],
        allowedHeaders: ["*"],
      },
    });

    // Outputs
    new CfnOutput(this, "StorageTableName", { value: storageTable.tableName });
    new CfnOutput(this, "FunctionUrl", { value: fnUrl.url });
  }
}
