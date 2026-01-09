#!/bin/bash

echo "Testing Admin Login..."
curl -X POST http://localhost:9000/admin/login \
  -d "username=admin&password=admin123" \
  -H "Content-Type: application/x-www-form-urlencoded"

echo -e "\n\nTesting Guest Login..."
curl -X POST http://localhost:9000/guest

echo -e "\n\nDone!"