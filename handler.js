'use strict';

import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand,
  DeleteItemCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';

  var client = new DynamoDBClient({ region: 'us-east-1' });
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data)

  }
}

export const createNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data;
  console.log(event.body);
  console.log(event);
  try {
    data = JSON.parse(event.body);
  } catch (parseError) {
    return callback(null, send(400, "Invalid JSON input"));
  }
  try {
   const params = {
    "TableName":`${NOTES_TABLE_NAME}`,
    "Item": {
      "notesId": {"S": `${data.id}`},
      "title": {"S": `${data.title}`},
      "body": {"S": `${data.body}`},
    },
    ConditionExpression: "attribute_not_exists(notesId)"
   }
   
   const command = new PutItemCommand(params);
   await client.send(command);
   callback(null,send(200,data));
      
  }catch (err) {
      callback(null, send(500, err.message)); 
  }  
};

export const updateNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId =  event.pathParameters.id;
  let data = JSON.parse(event.body);
  try{
    const params = {
      "TableName": `${NOTES_TABLE_NAME}`,
      "Key": {"notesId": {"S": `${notesId}`}},
      "UpdateExpression": "set #title = :title, #body = :body",
      "ExpressionAttributeNames": {"#title": "title", "#body" : "body"},
      "ExpressionAttributeValues": {
        ":title": {"S": `${data.title}`},
        ":body": {"S": `${data.body}`}
      },  
    "ConditionExpression": "attribute_exists(notesId)",       
  };

  const command = new UpdateItemCommand(params);
  await client.send(command);
  callback(null,send(200,data));

  }catch(err){
    callback(null, send(500, err.message));
  }
 
};

export const deleteNote = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId =  event.pathParameters.id;
  try{
      const params = {
        "TableName": `${NOTES_TABLE_NAME}`,
        "Key": {"notesId": {"S": `${notesId}`}},
        "ConditionExpression": "attribute_exists(notesId)",       
  };

  const command = new DeleteItemCommand(params);
  await client.send(command);
  callback(null,send(200,notesId));

  }catch(err){
    callback(null, send(500, err.message));
  }
};

export const getAllNotes = async (event, context, callback) => {
  console.log(JSON.stringify(event));
  context.callbackWaitsForEmptyEventLoop = false;
  try{
    const params = {
      "TableName": `${NOTES_TABLE_NAME}`,
           
   };

  const command = new ScanCommand(params);
  const notes = await client.send(command);
  callback(null,send(200,notes));

  }catch(err){
    callback(null, send(500, err.message));
  }
};
