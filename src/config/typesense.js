const Typesense = require('typesense');
const { TYPESENSE_HOST, TYPESENSE_API_KEY } = require('./env');

const typesense = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 2,
});

module.exports = typesense;
