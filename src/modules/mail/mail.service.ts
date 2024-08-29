import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as path from 'path';
import { AllConfigType } from 'src/configs/config.type';
import { MailerService } from 'src/shares/modules/mailer/mailer.service';
import { MailData } from './mail-data.interface';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    let emailConfirmTitle: 'Hahahahiiihu';

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: path.join(
        // this.configService.getOrThrow('app.workingDirectory', {
        //   infer: true,
        // }),
        'src',
        'modules',
        'mail',
        'templates',
        'confirmation.hbs',
      ),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        name: this.configService.get('app.name', { infer: true }),
      },
    });
  }
}
