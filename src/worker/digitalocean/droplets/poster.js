import { Worker } from '@scola/worker';

export default class DigitaloceanDropletsPoster extends Worker {
  act(box, data) {
    const options = this.filter(box, data);

    this.check(options, ['token']);

    const path = this.format('/', [
      '/v2/droplets',
      options.droplet_id,
      options.droplet_id ? 'actions' : null
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
      method: 'POST',
      url: {
        hostname: 'api.digitalocean.com',
        path
      }
    };

    this.pass(request, options.data);
  }
}
