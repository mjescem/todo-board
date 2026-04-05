#!/bin/sh
set -e

echo "Running Database Migrations..."
npm run db:migrate:prod

echo "Starting Todo Board Server..."
npm start
