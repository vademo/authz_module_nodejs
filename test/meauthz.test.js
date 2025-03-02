const chai = require('chai');
const axios = require('axios');
const logginghelper = require('../lib/helper/logging.helper');
const sinon = require('sinon');
const PermissionError = require('../lib/errors/permission.error');
const umPermissions = require('./data/um.permissions.json');
const axios401error = require('./data/axios.error401.json');
const { MEAUTHZ_CONFIG_MISSING, APPLICATIONID_MISSING, PERMISSION_CALL_FAILED } = require('../lib/errors/error.messages');

chai.use(require('sinon-chai'));

const { expect } = chai;
const config = require('../lib/config');
const um = require('../lib/services/datasources/meauthz.permissions');

const umConfig = {
  debug: true,
  source: 'meauthz',
  sources: {
    meauthzv2: {
      url: 'fakeurl',
      applicationId: 'FAKEAPP',
      apiKey: 'fakekey',
    },
  },
};

describe('Get Permissions from meAuthzv2:', () => {
  let sandbox;
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    done();
  });
  afterEach(() => {
    sandbox.restore();
  });
  it('Success', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    const logging = sandbox.spy(logginghelper.logger, 'error');
    sandbox.stub(axios, 'get').returns(Promise.resolve({ data: umPermissions }));
    const permissions = await um.getPermissions('FAKEAPP', 'FakeJWT');
    sinon.assert.notCalled(logging);
    expect(permissions).to.eql(umPermissions.permissions);
  });
  it('Success (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig });
    const logging = sandbox.spy(logginghelper.logger, 'error');
    sandbox.stub(axios, 'get').returns(Promise.resolve({ data: umPermissions }));
    const permissions = await um.getPermissions('FAKEAPP', 'FakeJWT');
    sinon.assert.notCalled(logging);
    expect(permissions).to.eql(umPermissions.permissions);
  });
  it('Error not configured (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ debug: true });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(Error);
      expect(e.message).to.eql(MEAUTHZ_CONFIG_MISSING);
      sinon.assert.called(logging);
    });
  });
  it('Error not configured (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ debug: true, sources: {} });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(Error);
      expect(e.message).to.eql(MEAUTHZ_CONFIG_MISSING);
      sinon.assert.called(logging);
    });
  });
  it('Error not configured', async () => {
    sandbox.stub(config, 'getConfig').returns({ debug: false });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(Error);
      expect(e.message).to.eql(MEAUTHZ_CONFIG_MISSING);
      sinon.assert.notCalled(logging);
    });
  });
  it('Error not configured applicationid', async () => {
    sandbox.stub(config, 'getConfig').returns({
      ...umConfig,
      debug: false,
      sources: {
        meauthzv2: {
          url: 'fakeurl',
          applicationId: false,
          apiKey: 'fakekey',
        },
      },
    });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(Error);
      expect(e.message).to.eql(APPLICATIONID_MISSING);
      sinon.assert.notCalled(logging);
    });
  });
  it('Error not configured applicationid (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({
      ...umConfig,
      debug: true,
      sources: {
        meauthzv2: {
          url: 'fakeurl',
          applicationId: false,
          apiKey: 'fakekey',
        },
      },
    });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(Error);
      expect(e.message).to.eql(APPLICATIONID_MISSING);
      sinon.assert.called(logging);
    });
  });
  it('Failed', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    const logging = sandbox.spy(logginghelper.logger, 'error');
    sandbox.stub(axios, 'get').returns(Promise.reject(new Error('errormessage')));
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e.message).to.eql('errormessage');
      sinon.assert.notCalled(logging);
    });
  });
  it('Failed (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: true });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    sandbox.stub(axios, 'get').returns(Promise.reject(new Error('errormessage')));
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(Error);
      expect(e.message).to.eql('errormessage');
      sinon.assert.called(logging);
    });
  });
  it('Failed "StatusCodeError" (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: true });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    // eslint-disable-next-line prefer-promise-reject-errors
    sandbox.stub(axios, 'get').returns(Promise.reject(axios401error));
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(PermissionError);
      expect(e.message).to.eql(PERMISSION_CALL_FAILED);
      sinon.assert.called(logging);
    });
  });
  it('Failed "StatusCodeError" no errordetail (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: true });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    // eslint-disable-next-line prefer-promise-reject-errors
    sandbox.stub(axios, 'get').returns(Promise.reject(axios401error));
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(PermissionError);
      expect(e.message).to.eql(PERMISSION_CALL_FAILED);
      sinon.assert.called(logging);
    });
  });
});
