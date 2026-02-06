#!/bin/bash

# Clean cache
rm -rf node_modules/.cache

# Reinstall dependencies
npm install

# Rebuild the project
npm run build

echo "Project has been cleaned, dependencies reinstalled, and rebuilt for deployment."