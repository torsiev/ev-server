import supertest from 'supertest';
import { server } from '../src/index';

describe('Server test', () => {
  const request = supertest.agent(server);

  afterAll((done) => {
    server.close(done);
  });

  it('Should get hello world', async () => {
    const res = await request.get('/');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      data: 'Hello World!',
    });
  });
});
