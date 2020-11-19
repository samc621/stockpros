#!/bin/bash

echo "wait for DB to start"
sleep 5
echo "running DB migration scripts"
npm run knex migrate:latest
echo "running DB seeder scripts"
npm run knex seed:run
echo "starting node server"
npm start
