This library enables you to utilize [AWS Lambda](https://aws.amazon.com/lambda/) and [Amazon API Gateway](https://aws.amazon.com/api-gateway/) to respond to web and API requests using your existing [Node.js](https://nodejs.org/) application framework. The sample provided allows you to easily build serverless web applications/services and RESTful APIs using the [Express](https://expressjs.com/) framework.

## Getting Started

```bash
npm install aws-serverless-express
```

```js
// lambda.js
'use strict'
const awsServerlessExpress = require('aws-serverless-express')
const app = require('./express-server')
const server = awsServerlessExpress.createServer(app)

exports.handler = (event, context) => awsServerlessExpress.proxy(server, event, context)
```

[Package and create your Lambda function](http://docs.aws.amazon.com/lambda/latest/dg/nodejs-create-deployment-pkg.html), then configure a simple proxy API using Amazon API Gateway and integrate it with your Lambda function.

## Example

In addition to a basic Lambda function and Express server, the `example` directory includes a [Swagger file](http://swagger.io/specification/), [CloudFormation template](https://aws.amazon.com/cloudformation/aws-cloudformation-templates/), and helper scripts to help you set up and manage your AWS assets.

### Steps for running the example
From your preferred project directory: `git clone https://github.com/awslabs/aws-serverless-express.git && cd aws-serverless-express/example`. This guide assumes you have already [set up an AWS account](http://docs.aws.amazon.com/AmazonSimpleDB/latest/DeveloperGuide/AboutAWSAccounts.html) and have the [AWS CLI](https://aws.amazon.com/cli/) installed.

1. Run `npm run config <accountId> <bucketName> [region]` to configure the example, eg. `npm run config 123456789012 my-bucket us-west-2`. This modifies `package.json`,  `simple-proxy-api.yaml`, and `cloudformation.json` with your account ID, bucket, and region (region defaults to `us-east-1`). If the bucket you specify does not yet exist, the next step will create it for you.
2. Run `npm run setup` - this installs the node dependencies; creates the S3 bucket (if it does not already exist); packages and uploads your serverless Express application assets to S3; uploads the API Swagger file to S3; and finally spins up a CloudFormation stack, creating your API Gateway API and Lambda Function.
3. After the setup command completes, your browser will open to the CloudFormation console (sign in if necessary). Select the `AwsServerlessExpressStack` stack, and wait several minutes for the status to change to `CREATE_COMPLETE`, then click the `ApiUrl` value under the __Outputs__ section - this will open a new page with your running API. The API index lists the resources available in the example Express server (`express-server.js`), along with example `curl` commands.
4. See the sections below for details on how to migrate an existing (or create a new) Node.js project based on this example. If you would prefer to delete AWS assets that were just created, simply run `npm run delete-stack` to delete the CloudFormation Stack, including the API and Lambda Function. If you specified a new bucket in the `config` command for step 1 and want to delete that bucket, run `npm run delete-bucket`.

### Creating or migrating a Node.js project based on the example

To use this example as a base for a new Node.js project:

1. Copy the files in the `example` directory into a new project directory (`cp -r ./example ~/projects/my-new-node-project`). If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (you may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. After making updates to `express-server.js`, simply run `npm run package-upload-update-function`. This will compress `lambda.js`, `express-server.js`, `index.html`, and your `node_modules` directory into `lambda-function.zip`, upload that zip to S3, and update your Lambda function.

To migrate an existing Node server:

1. Copy the following files from the `example` directory: `api-gateway-event.json`, `cloudformation.json`, `lambda.js`, and `simple-proxy-api.yaml`. Additionally, copy the `scripts` and `config` sections of `example/package.json` into your existing `package.json` - this includes many helpful commands to manage your AWS serverless assets and perform _basic_ local simulation of API Gateway and Lambda. If you have not already done so, follow the [steps for running the example](#steps-for-running-the-example) (be sure to copy over `configure.js` first) (you may want to first modify some of the resource names to something more project-specific, eg. the CloudFormation stack, Lambda function, and API Gateway API).
2. From your existing project directory, run `npm install --save aws-serverless-express`.
3. Modify `lambda.js` to import your own server configuration (eg. change `require('./express-server')` to `require('./app')`). You will need to ensure you export your app configuration from the necessary file (eg. `module.exports = app`). This library takes your app configuration and listens on a Unix Domain Socket for you, so you can remove your call to `app.listen()` (if you have a `server.listen` callback, you can provide it as the second parameter in the `awsServerlessExpress.createServer` method).
4. Modify the `package-function` script in `package.json` to include all files necessary to run your application. If everything you need is in a single child directory, this is as simple as changing `express-server.js` to `my-app-dir` (also remove `index.html` from that command). If you are using a build tool, you will instead want to add your build output directory to this command.
5. Run `npm run package-upload-update-function` to package (zip), upload (to S3), and update your Lambda function.

To perform a basic, local simulation of API Gateway and Lambda with your Node server, update `api-gateway-event.json` with some values that are valid for your server (`httpMethod`, `path`, `body` etc.) and run `npm run local`. AWS Lambda uses NodeJS 4.3 LTS, and it is recommended to use the same version for testing purposes.

If you need to make modifications to your API Gateway API, modify `simple-proxy-api.yaml` and run `npm run upload-api-gateway-swagger && npm run update stack`. If your API does not require CORS, you can remove the two `options` methods defined in the Swagger file. Note: there is currently an issue with updating CloudFormation when it's not obvious that one of its resources has been modified; eg. the Swagger file is an external file hosted on S3. To work around this, simply update one of the resource's properties, such as the `Description` on the `ApiGatewayApi` resource. To modify your other AWS assets, make your changes to `cloudformation.json` and run `npm run update-stack`. Alternatively, you can manage these assets via the AWS console.