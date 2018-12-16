import { Worker } from '@scola/worker';

export default class DigitaloceanFloatingipsPoster extends Worker {
  act(box, data) {
    const {
      request,
      requestData
    } = this.filter(box, data);

    this.check(request, ['token', 'ip']);

    const path = this.stringify('/', [
      '/v2/floating_ips',
      request.ip,
      request.ip ? 'actions' : null
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
      method: 'POST',
      url: {
        hostname: 'api.digitalocean.com',
        path
      }
    }, requestData);
  }
}
