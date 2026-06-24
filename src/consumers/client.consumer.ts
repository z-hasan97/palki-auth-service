import { Injectable } from '@nestjs/common';

@Injectable()
export class ClientConsumer {
  async handle(payload: any) {
    return [{ id: '1', name: 'Client One', email: 'client@test.com' }];
  }
}
