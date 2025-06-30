#!/bin/bash

echo "⏳ Waiting for MongoDB to be ready..."
until mongosh --host mongo --port ${MONGO_PORT} -u ${MONGO_USER} -p ${MONGO_PASSWORD} --authenticationDatabase admin --eval 'db.adminCommand("ping")' &>/dev/null; do
  sleep 2
done

echo "✅ Connected to MongoDB. Initiating replica set..."

mongosh --host mongo --port ${MONGO_PORT} -u ${MONGO_USER} -p ${MONGO_PASSWORD} --authenticationDatabase admin <<EOF
rs.initiate({
  _id: "rs0",
  members: [{ _id: 0, host: "mongo:${MONGO_PORT}" }]
})
EOF

echo "✅ Replica set initiated."