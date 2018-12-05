import { Worker } from '@scola/worker';

export default class GetDigitaloceanDropletsRequester extends Worker {
  act(box, data) {
    const options = this.filter(box, data);

    const postfix = options.id ? '/' + options.id : '';

    const request = {
      extra: {
        box,
        data
      },
      headers: {
        'Authorization': `Bearer ${options.token}`,
        'Content-Type': 'application/json'
      },
      method: 'GET',
      url: {
        hostname: 'api.digitalocean.com',
        path: `/v2/droplets${postfix}`,
        query: options.query
      }
    };

    this.pass(request);
  }
}
