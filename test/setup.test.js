const sinon = require('sinon');

// silence logs during tests
sinon.stub(console, 'warn').returns();
sinon.stub(console, 'error').returns();
