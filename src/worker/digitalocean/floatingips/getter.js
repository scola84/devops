import { Worker } from '@scola/worker';

export default class DigitaloceanFloatingipsGetter extends Worker {
  static merge(box, data, responseData) {
    const ip = responseData.floating_ip;

    if (ip.droplet === null || ip.droplet.id !== data.server.id) {
      data.server.actions.assign_floating_ip = true;
    }

    return data;
  }

  act(box, data) {
    const options = this.filter(box, data);

    this.check(options, ['token']);

    const path = this.format('/', [
      '/v2/floating_ips',
      options.ip
    ]);

    const token = this.format('Bearer %(token)s', options);

    const request = {
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
        path
      }
    };

    this.pass(request);
  }
}
