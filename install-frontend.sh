#!/bin/bash
cd /Users/sagarm/Workstation/Blockchain/frontend
npm install --legacy-peer-deps > /tmp/frontend-install-output.log 2>&1
exit_code=$?
if [ $exit_code -eq 0 ]; then
  echo "✅ Frontend dependencies installed successfully!"
else
  echo "❌ Frontend installation failed with code $exit_code"
  tail -20 /tmp/frontend-install-output.log
fi
exit $exit_code
