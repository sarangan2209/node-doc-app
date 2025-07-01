## Developer Documentation

### File: index.ts

This file is the entry point for deploying AWS CloudFormation stacks using the AWS Cloud Development Kit (CDK) in a Node.js environment.

#### Usage:

```bash
#!/usr/bin/env node
```

This line specifies that the script should be executed using the Node.js runtime.

```bash
import * as cdk from 'aws-cdk-lib';
import { s3CdnStack } from '../lib/cloudfront-stack';
import { LambdaEdgeStack } from '../lib/lambda-edge-stack';
```

These lines import necessary modules from the AWS CDK library and custom stacks defined in separate files for CloudFront and Lambda Edge stacks.

```bash
const projectName = 'jsdocs'
```

Defines the project name as 'jsdocs'.

```bash
const app = new cdk.App();
```

Creates a new CDK App instance.

```bash
const projectEnvironment = 'development'
```

Defines the project environment as 'development'.

```bash
const env = {
  account: process.env.AWS_ACCOUNT_ID ?? process.env.CDK_DEFAULT_ACCOUNT,
  region: 'us-east-1',
}
```

Sets up the environment configuration with AWS account ID and region information.

```bash
const lambdaStack = new LambdaEdgeStack(app, 
  {
    env: env,
    projectEnvironment: projectEnvironment,
    projectName: projectName,
    gitRevision: 'test',
  },
  `${projectName}-lambda-${projectEnvironment}-stack`
);
```

Creates a new instance of the Lambda Edge stack with the specified environment and project details.

```bash
new s3CdnStack(app,
  {
    env: env,
    projectEnvironment: projectEnvironment,
    projectName: projectName,
    gitRevision: 'test',
  },
  `${projectName}-cloudfront-${projectEnvironment}-stack`
);
```

Creates a new instance of the S3 CDN stack with the specified environment and project details.

### Note:

- Make sure to set the necessary environment variables (AWS_ACCOUNT_ID, CDK_DEFAULT_ACCOUNT) before running the script.
- Update the `gitRevision` parameter with the desired value before deploying the stacks.
- Ensure that the Lambda Edge stack is deployed before deploying the CloudFront stack to avoid any dependency issues.