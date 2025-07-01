## CustomStack Class

`CustomStack` is a custom stack class that extends `Stack` from the AWS CDK library. It is used to define a custom stack with specific properties.

### Properties

- `projectName`: A string representing the name of the project.
- `gitRevision`: A string representing the Git revision of the project.
- `projectEnvironment` (optional): A string representing the environment of the project.
- `lambdaEdgeArn` (optional): A string representing the ARN of the Lambda Edge function.

### Constructor

#### Parameters

- `scope`: An instance of `Construct` representing the scope of the stack.
- `props`: An instance of `CustomStackProps` representing the custom properties of the stack.
- `stackName`: A string representing the name of the stack.

#### Usage

```javascript
const customStack = new CustomStack(this, {
    projectName: 'MyProject',
    gitRevision: 'abcd1234',
    projectEnvironment: 'dev',
    lambdaEdgeArn: 'arn:aws:lambda:us-east-1:123456789012:function:MyFunction',
}, 'CustomStack');
```

### Tagging

The `CustomStack` class automatically adds tags to the stack based on the provided properties. The following tags are added:

- `Environment`: The project environment (if provided).
- `Project`: The name of the project.
- `GitRevision`: The Git revision of the project.
- `StackName`: The name of the stack.

### Error Handling

If the `gitRevision` property is not provided, an error will be thrown with the message "Git Revision must be provided".