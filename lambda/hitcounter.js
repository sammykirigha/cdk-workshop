const { DynamoDB, Lambda } = require("aws-sdk");

exports.handler = async function (event) {
  console.log("request: ", JSON.stringify(event, undefined, 2));

  //create AWS SDK clients
  const dynamo = new DynamoDB();
  const lambda = new Lambda();

  //update dynamo entry for "path" with hits++
  await dynamo
    .updateItem({
      TableName: process.env.HITS_TABLE_NAME,
      Key: { path: { S: event.path } },
      UpdateExpression: "ADD hits : incr",
      ExpressionAttributesValues: { ":incr": { N: "1" } },
    })
    .promise();

  //update downstream function and capture
  const resp = await lambda
    .invoke({
      FunctionName: process.env.DOWNSTREAM_FUNCTION_NAME,
      payload: JSON.stringify(event),
    })
    .promise();

  console.log("downstream response: ", JSON.stringify(resp, undefined, 2));

  return JSON.parse(resp.Payload);
};
