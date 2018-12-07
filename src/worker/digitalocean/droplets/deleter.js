import { Worker } from '@scola/worker';

export default class DigitaloceanDropletDeleter extends Worker {
  act(box, data) {
    const options = this.filter(box, data);

    this.check(options, ['token', 'droplet_id']);

    const token = this.sprintf('Bearer %(token)s', options);
    const path = this.sprintf('/v2/droplets/%(droplet_id)s', options);

    const request = {
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
      },
      method: 'DELETE',
      url: {
        hostname: 'api.digitalocean.com',
        path
      }
    };

    this.pass(request);
  }
}
