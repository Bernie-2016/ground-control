#!/usr/bin/env babel-node --optional es7.asyncFunctions

import fs from 'fs';
import path from 'path';
import { Schema } from './schema';
import { graphql }  from 'graphql';
import { introspectionQuery, printSchema } from 'graphql/utilities';

export default async function writeSchema() {
  await async function() {
    let result = await (graphql(Schema, introspectionQuery));
    if (result.errors) {
      console.error(
        'ERROR introspecting schema: ',
        JSON.stringify(result.errors, null, 2)
      );
    } else {
      fs.writeFileSync(
        path.join('/', 'tmp', 'schema.json'),
        JSON.stringify(result, null, 2)
      );
    }
  }();
  fs.writeFileSync(
    path.join('/', 'tmp', 'schema.graphql'),
    printSchema(Schema)
  );
}
