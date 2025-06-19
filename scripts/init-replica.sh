#!/bin/bash

m1=mongo
port=${MONGO_PORT:-27017}

echo "⏳ Waiting for ${m1}:${port} to be ready..."

until mongosh --host ${m1}:${port} --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
  printf '.'
  sleep 1
done

echo -e "\n✅ MongoDB is up, initializing replica set..."

mongosh --host ${m1}:${port} <<EOF
var rootUser = '${MONGO_USER}';
var rootPassword = '${MONGO_PASSWORD}';
var admin = db.getSiblingDB('admin');
admin.auth(rootUser, rootPassword);

var config = {
    "_id": "rs0",
    "members": [
        { "_id": 0, "host": "${m1}:${port}", "priority": 1 }
    ]
};
rs.initiate(config);
EOF

echo "Replica set initiated."