const chai = require('chai');
const sinon = require('sinon');
const config = require('../lib/config');
const permissionService = require('../lib/services/permissions.service');
const um = require('../lib/services/datasources/authzv2.permissions');
const meauthz = require('../lib/services/datasources/meauthz.permissions');

chai.use(require('sinon-chai'));

const { expect } = chai;
const umConfig = {
  debug: true,
  applicationId: 'FAKEAPP',
  source: 'authzv2',
  sources: {
    authzv2: {
      url: 'fakeurl',
      apiKey: 'fakekey',
    },
  },
};

describe('permissions.service', () => {
  let sandbox;
  let umsstub;
  let mestub;
  const fakeReq = {};
  beforeEach((done) => {
    sandbox = sinon.createSandbox();
    fakeReq.get = sandbox.stub().returns('faketoken');
    umsstub = sandbox.stub(um, 'getPermissions').resolves(['permission3', 'permission2', 'permission1']);
    mestub = sandbox.stub(meauthz, 'getPermissions').resolves(['mepermission3', 'mepermission2', 'mepermission1']);
    done();
  });
  afterEach(() => {
    sandbox.restore();
  });

  it('Configured', () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    permissionService.getPermissions('faketoken', 'authzv2');
    sinon.assert.called(umsstub);
  });
  it('Configured get by config', () => {
    sandbox.stub(config, 'getConfig').returns({ ...umConfig, debug: false });
    permissionService.getPermissions('faketoken');
    sinon.assert.called(umsstub);
  });
  it('request spesific source in call', async () => {
    sandbox.stub(config, 'getConfig').returns({
      debug: true,
      applicationId: 'FAKEAPP',
      source: 'authzv2',
      sources: {
        authzv2: {
          url: 'fakeurl',
          apiKey: 'fakekey',
        },
        meauthzv2: {
          url: 'fakeurl',
          apiKey: 'fakekey',
        },
      },
    });
    const permissions = await permissionService.getPermissions('faketoken', 'authzv2');
    sinon.assert.called(umsstub);
    expect(permissions).to.eql(['permission3', 'permission2', 'permission1']);
    const mepermissions = await permissionService.getPermissions('faketoken', 'meauthzv2');
    expect(mepermissions).to.eql(['mepermission3', 'mepermission2', 'mepermission1']);
    sinon.assert.called(mestub);
  });
  it('Use cache', async () => {
    sandbox.stub(config, 'getConfig').returns({
      cache: true,
      debug: true,
      applicationId: 'FAKEAPP',
      source: 'authzv2',
      sources: {
        authzv2: {
          url: 'fakeurl',
          apikey: 'fakekey',
        },
      },
    });
    const permissions = await permissionService.getPermissions('faketoken', 'authzv2');
    const permissionsCache = await permissionService.getPermissions('faketoken', 'authzv2');
    sinon.assert.calledOnce(umsstub);
    expect(permissions).to.eql(permissionsCache);
  });
  it('request permissions from external service ', async () => {
    const externalPermissionService = sandbox.stub().returns(['permission1', 'permission2']);
    sandbox.stub(config, 'getConfig').returns({
      debug: true,
      applicationId: 'FAKEAPP',
      source: 'authzv2',
      sources: {
        authzv2: {
          url: 'fakeurl',
          apiKey: 'fakekey',
        },
        meauthzv2: {
          url: 'fakeurl',
          apiKey: 'fakekey',
        },
        externalPermissionService,
      },
    });
    const permissions = await permissionService.getPermissions('faketoken', 'externalPermissionService');
    sinon.assert.called(externalPermissionService);
    expect(permissions).to.eql(['permission1', 'permission2']);
  });
});
