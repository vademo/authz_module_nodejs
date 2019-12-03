const chai = require('chai');
const request = require('request-promise');
const logginghelper = require('../lib/helper/logging.helper');
const sinon = require('sinon');
const PermissionError = require('../lib/errors/permission.error');
const umPermissions = require('./data/um.permissions.json');
const { AUTHZV2_CONFIG_MISSING, APPLICATIONID_MISSING, PERMISSION_CALL_FAILED } = require('../lib/errors/error.messages');

chai.use(require('sinon-chai'));

const { expect } = chai;
const config = require('../lib/config');
const um = require('../lib/services/datasources/authzv2.permissions');

const umConfig = {
  debug: true,
  source: 'authzv2',
  sources: {
    authzv2: {
      url: 'fakeurl',
      applicationId: 'FAKEAPP',
      apiKey: 'fakekey',
    },
  },
};
describe('Get Permissions from authzv2:', () => {
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
    sandbox.stub(request, 'get').returns(Promise.resolve(umPermissions));
    const permissions = await um.getPermissions('FAKEAPP', 'FakeJWT');
    sinon.assert.notCalled(logging);
    expect(permissions).to.eql(umPermissions.permissions);
  });
  it('Success (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig });
    const logging = sandbox.spy(logginghelper.logger, 'error');
    sandbox.stub(request, 'get').returns(Promise.resolve(umPermissions));
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
      expect(e.message).to.eql(AUTHZV2_CONFIG_MISSING);
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
      expect(e.message).to.eql(AUTHZV2_CONFIG_MISSING);
      sinon.assert.notCalled(logging);
    });
  });
  it('Error not configured applicationid', async () => {
    sandbox.stub(config, 'getConfig').returns({
      ...umConfig,
      debug: false,
      sources: {
        authzv2: {
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
        authzv2: {
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
    sandbox.stub(request, 'get').returns(Promise.reject(new Error('errormessage')));
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
    sandbox.stub(request, 'get').returns(Promise.reject(new Error('errormessage')));
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
    sandbox.stub(request, 'get').returns(Promise.reject({ name: 'StatusCodeError', message: "shouldn't resolve", error: { title: 'title' } }));
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
    sandbox.stub(request, 'get').returns(Promise.reject({ name: 'StatusCodeError', message: "shouldn't resolve" }));
    await um.getPermissions('FAKEAPP', 'FakeJWT').then((result) => {
      throw new Error("shouldn't resolve", result);
    }).catch((e) => {
      expect(e).to.be.instanceof(PermissionError);
      expect(e.message).to.eql(PERMISSION_CALL_FAILED);
      sinon.assert.called(logging);
    });
  });
});
