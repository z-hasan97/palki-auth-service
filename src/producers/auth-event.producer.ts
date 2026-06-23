import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthEventProducer {
  async publishUserRegistered(data: any) { return data; }
  async publishUserLoggedIn(data: any) { return data; }
  async publishUserLoggedOut(data: any) { return data; }
}
