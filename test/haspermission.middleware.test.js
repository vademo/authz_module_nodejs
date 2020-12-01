const chai = require('chai');
const sinon = require('sinon');
const axios = require('axios');
const config = require('../lib/config');
const { TOKEN_MISSING, PERMISSION_MISSING } = require('../lib/errors/error.messages');
const umPermissions = require('./data/um.permissions.json');
const hasPermission = require('../lib/middlewares/haspermission.middleware');
const PermissionError = require('../lib/errors/permission.error');
const logginghelper = require('../lib/helper/logging.helper');
const authzv2 = require('../lib/services/datasources/authzv2.permissions');

chai.use(require('sinon-chai'));

const { expect } = chai;
const umConfig = {
  debug: true,
  applicationId: 'FAKEAPP',
  source: 'authzv2',
  tokenLocation: 'headers.authorization',
  sources: {
    authzv2: {
      url: 'fakeurl',
      apiKey: 'fakekey',
      applicationId: 'FAKEAPP',
    },
    meauthzv2: {
      url: 'fakeurl',
      apiKey: 'fakekey',
      applicationId: 'FAKEAPP',
    },
  },
};

describe('Haspermission middleware', () => {
  let sandbox;
  const fakeReq = {};
  let nextStub;
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    fakeReq.get = sandbox.stub().returns('faketoken');
    fakeReq.headers = {
      authorization: 'faketoken',
    };
    nextStub = sandbox.stub();
    done();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('Permissions array', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    const middleware = hasPermission(['permission2', 'permission1']);
    await middleware(fakeReq, {}, nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg, 'Next shoudn`t be called with argument if successful`').to.be.undefined;
  });
  it('Permissions array (with datasource meauthzv2)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    sandbox.stub(axios, 'get').returns(Promise.resolve({ data: umPermissions }));
    const middleware = hasPermission(['login-app'], 'meauthzv2');
    await middleware(fakeReq, {}, nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg, 'Next shoudn`t be called with argument if successful`').to.be.undefined;
  });
  it('Permissions array (with datasource meauthz)', async () => {
    sandbox.stub(config, 'getConfig').returns({
      debug: true,
      applicationId: 'FAKEAPP',
      source: 'authzv2',
      tokenLocation: 'headers.authorization',
      sources: {
        authzv2: {
          url: 'fakeurl',
          apiKey: 'fakekey',
          applicationId: 'FAKEAPP',
        },
        meauthz: {
          url: 'fakeurl',
          apiKey: 'fakekey',
          applicationId: 'FAKEAPP',
        },
      },
    });
    sandbox.stub(axios, 'get').returns(Promise.resolve({ data: umPermissions }));
    const middleware = hasPermission(['login-app'], 'meauthz');
    await middleware(fakeReq, {}, nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg, 'Next shoudn`t be called with argument if successful`').to.be.undefined;
  });
  it('missing auth', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    const middleware = hasPermission(['permission2', 'permission1']);
    const reqMissingAuth = { get: sandbox.stub().returns('') };
    await middleware(reqMissingAuth, {}, nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg).to.be.instanceof(Error);
    expect(errArg).to.be.instanceof(PermissionError);
    expect(errArg.message).to.equal(TOKEN_MISSING);
  });
  it('Permissions empty', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    const middleware = hasPermission();
    await middleware(fakeReq, {}, nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg, 'Next shoudn`t be called with argument if successful`').to.be.undefined;
  });
  it('Auth different location', async () => {
    fakeReq.session = {
      authorization: 'faketoken',
    };
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false, tokenLocation: 'session.authorization' });
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    const middleware = hasPermission('permission1');
    await middleware(fakeReq, {}, nextStub);

    sinon.assert.called(nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg, 'Next shoudn`t be called with argument if successful`').to.be.undefined;
  });
  it('Auth different location missing', async () => {
    fakeReq.session = {
      authorization: false,
    };
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false, tokenLocation: 'session.authorization' });
    const middleware = hasPermission(['permission2', 'permission1']);
    await middleware(fakeReq, {}, nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg).to.be.instanceof(Error);
    expect(errArg).to.be.instanceof(PermissionError);
    expect(errArg.message).to.equal(TOKEN_MISSING);
  });
  it('Permission string', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    const middleware = hasPermission('permission1');
    await middleware(fakeReq, {}, nextStub);

    sinon.assert.called(nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg, 'Next shoudn`t be called with argument if successful`').to.be.undefined;
  });
  it('Hassn`t permission', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission1']);
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    const middleware = hasPermission(['missing-permission']);
    await middleware(fakeReq, {}, nextStub);
    sinon.assert.called(nextStub);
    const errArg = nextStub.firstCall.args[0];
    expect(errArg).to.be.instanceof(Error);
    expect(errArg).to.be.instanceof(PermissionError);
    expect(errArg.message).to.equal(`${PERMISSION_MISSING} missing-permission`);
    sinon.assert.notCalled(logging);
  });
  it('Hassn`t permission (debug)', async () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: true });
    const logging = sandbox.spy(logginghelper.logger, 'warn');
    const middleware = hasPermission(['missing-permission']);
    sandbox.stub(authzv2, 'getPermissions').resolves(['permission1']);
    await middleware(fakeReq, {}, nextStub);

    sinon.assert.called(nextStub);
    sinon.assert.called(logging);

    const errArg = nextStub.firstCall.args[0];
    expect(errArg).to.be.instanceof(Error);
    expect(errArg).to.be.instanceof(PermissionError);
    expect(errArg.message).to.equal(`${PERMISSION_MISSING} missing-permission`);
    const loggingArg = logging.firstCall.args[0];
    expect(loggingArg).to.equal('There was a permission error:  Missing permissions: missing-permission');
  });
});
