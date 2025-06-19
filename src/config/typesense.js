const Typesense = require('typesense');

const typesense = new Typesense.Client({
  nodes: [
    {
      host: 'typesense',
      port: 8108,
      protocol: 'http',
    },
  ],
  apiKey: 'xyz',
  connectionTimeoutSeconds: 2,
});

module.exports = typesense;
