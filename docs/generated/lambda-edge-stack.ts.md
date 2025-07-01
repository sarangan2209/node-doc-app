# LambdaEdgeStack

This file contains the `LambdaEdgeStack` class, which is a custom stack that deploys a Lambda function in AWS CDK for use with AWS Lambda@Edge.

## Prerequisites
- Node.js 12.x or higher
- AWS CDK installed globally

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `cdk deploy` to deploy the stack

## Usage
```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { CustomStackProps } from './stack';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';

export class LambdaEdgeStack extends cdk.Stack {
  public readonly edgeLambdaVersion: lambda.IVersion;

  constructor(scope: Construct, props: CustomStackProps, id: string) {
    super(scope, id, {
      ...props,
      env: { region: 'us-east-1' }, 
    });

    const fn = new lambda.Function(this, 'BasicAuthFn', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
    });

    this.edgeLambdaVersion = fn.currentVersion;
  }
}
```

## Constructor
- `scope`: The parent Construct. Must not be `null` or empty.
- `props`: The custom stack properties.
- `id`: The ID of the stack.

## Properties
- `edgeLambdaVersion`: The version of the Lambda function deployed in the stack.

## Dependencies
- `aws-cdk-lib`: AWS Cloud Development Kit
- `constructs`: CDK Constructs for defining AWS CloudFormation templates
- `aws-cdk-lib/aws-lambda`: AWS Lambda module for CDK
- `path`: Node.js module for handling file paths

## License
Licensed under the MIT License. See [LICENSE](#) for more information.