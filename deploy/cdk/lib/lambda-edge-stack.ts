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
  
      const version = fn.currentVersion;
      this.edgeLambdaVersion = version;
  
      new cdk.CfnOutput(this, `${id}-EdgeLambdaVersionArn`, {
        value: version.functionArn,
        exportName: `${id}-EdgeLambdaVersionArn`,
      });
    }
  }
  
  
