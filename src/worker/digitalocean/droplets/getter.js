import { Worker } from '@scola/worker';
import { parse } from 'bytes';

export default class DigitaloceanDropletsGetter extends Worker {
  static merge(box, data, responseData) {
    return merge(box, data, responseData);
  }

  act(box, data) {
    const { request } = this.filter(box, data);

    const path = this.stringify('/', [
      '/v2/droplets',
      request.droplet_id
    ]);

    const token = this.stringify('Bearer %(token)s', request);

    this.pass({
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      method: 'GET',
      url: {
        hostname: 'api.digitalocean.com',
        path,
        query: request.query
      }
    });
  }
}

function merge(box, data, responseData) {
  const mode = responseData.droplets ? 'multi' : 'single';

  const remotes = mode === 'multi' ?
    responseData.droplets : [responseData.droplet];

  const locals = mode === 'multi' ?
    data : [data];

  mergeLocals(locals, remotes);
  mergeRemotes(locals, remotes);

  return mode === 'multi' ? locals : locals.shift();
}

function mergeLocals(locals, remotes) {
  locals.forEach((local) => {
    let found = null;

    remotes.forEach((remote) => {
      if (remote.name === local.name) {
        found = remote;
      }
    });

    if (found === null) {
      local.server.actions.create = true;
    }
  });
}

function mergeRemotes(locals, remotes) {
  remotes.forEach((remote) => {
    let found = null;

    locals.forEach((local) => {
      if (remote.name === local.name) {
        found = local;
      }
    });

    if (found !== null) {
      try {
        checkId(found, remote);
        checkStatus(found, remote);
        checkNetwork(found, remote);
        checkRegion(found, remote);
        checkSize(found, remote);
      } catch (error) {
        found.server.status = 'error';
        found.error = error;
      }
    } else {
      locals.push({
        server: {
          actions: {
            delete: true
          },
          id: remote.id
        }
      });
    }
  });
}

function checkId(local, remote) {
  local.server.id = remote.id;
}

function checkNetwork(local, remote) {
  const v4 = remote.networks.v4 || [];
  const map = { public: 'eth0', private: 'eth1' };
  let ifc = null;

  v4.forEach((network) => {
    ifc = map[network.type];

    if (local.server.networks.v4[ifc]) {
      if (local.server.networks.v4[ifc] !== network.ip_address) {
        throw new Error('IP addresses do not match' +
          ` (local=${local.server.networks.v4[ifc]}` +
          `, remote=${network.ip_address})`);
      }
    }

    local.server.networks.v4[ifc] = network.ip_address;
  });

  if (local.server.networks.v4.eth1 === '') {
    if (remote.region.features.indexOf('private_networking') === -1) {
      throw new Error('Private networking not available' +
        ` (remote=${remote.region.features})`);
    }

    local.server.actions.enable_private_networking = true;
  }
}

function checkRegion(local, remote) {
  if (local.server.region !== remote.region.slug) {
    throw new Error('Regions do not match' +
      ` (local=${local.server.region}, remote=${remote.region.slug})`);
  }
}

function checkSize(local, remote) {
  if (local.server.size !== remote.size_slug) {
    if (remote.region.sizes.indexOf(local.server.size) === -1) {
      throw new Error('Size not available' +
        ` (local=${local.server.size}, remote=${remote.region.sizes})`);
    }

    const [, , localSize] = local.server.size.split('-');
    const [, , remoteSize] = remote.size_slug.split('-');

    if (parse(localSize) < parse(remoteSize)) {
      throw new Error('Size cannot be decreased' +
        ` (local=${localSize}, remote=${remoteSize})`);
    }

    local.server.actions.resize = true;
  }
}

function checkStatus(local, remote) {
  local.server.status = remote.status;
}
