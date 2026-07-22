import { Injectable } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { OtpService } from '../services/otp.service';
import { KafkaProducerService } from '@palki/messaging';
import { MessageSignerService } from '@palki/messaging';

@Injectable()
export class RegisterConsumer {
  constructor(
    private readonly userService: UserService,
    private readonly otpService: OtpService,
    private readonly producer: KafkaProducerService,
    private readonly signer: MessageSignerService,
  ) {}

  async handle(payload: any) {
    const firstName = payload.firstName || '';
    const lastName = payload.lastName || '';
    const data: any = {
      password: payload.password,
      name: payload.name || (firstName + ' ' + lastName).trim(),
    };
    
    if (payload.email) data.email = payload.email;
    if (payload.phone || payload.phoneNumber) data.phone = payload.phone || payload.phoneNumber;

    const user = await this.userService.create(data);
    const recipient = payload.email || payload.phone || payload.phoneNumber;
    await this.otpService.generateAndSend(recipient, 'REGISTRATION');

    // Send profile data to user-service via Kafka
    try {
      const profilePayload = {
        userId: user.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        dob: payload.dob,
        age: payload.age,
        gender: payload.gender,
        height: payload.height,
        phoneNumber: payload.phone || payload.phoneNumber,
        whatsapp: payload.whatsapp,
        maritalStatus: payload.maritalStatus,
        profession: payload.profession,
        designation: payload.designation,
        degreeName: payload.degreeName,
        university: payload.university,
        fatherProfession: payload.fatherProfession,
        motherProfession: payload.motherProfession,
        nationality: payload.nationality,
        religion: payload.religion,
        presentAddress: payload.presentAddress,
        permanentAddress: payload.permanentAddress,
        registerFor: payload.registerFor,
        proPic: payload.proPic,
      };
      
      // Send directly without signer wrapper for simplicity
      await this.producer.send('profile.create', {
        key: user.id,
        value: JSON.stringify({
          commandType: 'profile.create',
          data: profilePayload,
          correlationId: payload.correlationId,
          messageId: payload.messageId,
        }),
      });
    } catch (err: any) {
      console.error('Failed to send profile.create:', err.message); console.error(err.stack);
    }

    return { userId: user.id, state: user.state, message: 'OTP sent to ' + recipient };
  }
}
