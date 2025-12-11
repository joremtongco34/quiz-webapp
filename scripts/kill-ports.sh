#!/bin/bash
# Script to kill processes on ports 3001 and 3002

echo "Stopping servers on ports 3001 and 3002..."

# Kill port 3001
if lsof -ti:3001 > /dev/null 2>&1; then
    lsof -ti:3001 | xargs kill -9
    echo "✓ Stopped process on port 3001"
else
    echo "  No process found on port 3001"
fi

# Kill port 3002
if lsof -ti:3002 > /dev/null 2>&1; then
    lsof -ti:3002 | xargs kill -9
    echo "✓ Stopped process on port 3002"
else
    echo "  No process found on port 3002"
fi

echo "Done!"
