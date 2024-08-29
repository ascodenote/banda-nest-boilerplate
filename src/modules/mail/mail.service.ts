import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
import { AllConfigType } from 'src/configs/config.type';
import { MailerService } from 'src/shares/modules/mailer/mailer.service';
import { MailData } from './mail-data.interface';
import { readFileSync } from 'fs';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const fileImg = path.join(__dirname, '/templates/FUA_logo.png');
    const imageData = readFileSync(fileImg).toString('base64');
    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Welcome to FUA Academy! Confirm your Email',
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'templates',
        'confirmation.hbs',
      ),
      context: {
        url: url.toString(),
        app_name: this.configService.get('app.name', { infer: true }),
        name: this.configService.get('app.name', { infer: true }),
        imageUrl: imageData,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const fileImg = path.join(__dirname, '/templates/FUA_logo.png');
    const imageData = readFileSync(fileImg).toString('base64');
    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'FUA Academy! Reset Password',
      templatePath: path.join(
        this.configService.getOrThrow('app.workingDirectory', {
          infer: true,
        }),
        'src',
        'modules',
        'mail',
        'templates',
        'forget.hbs',
      ),
      context: {
        url: url.toString(),
        app_name: this.configService.get('app.name', { infer: true }),
        name: this.configService.get('app.name', { infer: true }),
        imageUrl: imageData,
        tokenExpires: mailData.data.tokenExpires.toString(),
      },
    });
  }
}
