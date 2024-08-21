import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from '../user/entities/user.entity';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { createReadStream, readFileSync } from 'fs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { join } from 'path';
import * as path from 'path';
import * as pug from 'pug';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(user: User, token: string) {
    const url = `https://www.fatihua.com/auth/confirm?token=${token}`;
    try {
      await this.mailerService.sendMail({
        to: user.email,
        // from: '"Support Team" <support@example.com>', // override default from
        subject: 'Welcome to FUA Academy! Confirm your Email',
        template: './confirmation', // `.hbs` extension is appended automatically
        context: {
          // ✏️ filling curly brackets with content
          name: user.name,
          url,
        },
        attachments: [
          {
            filename: 'FUA_logo.png',
            path: __dirname + '/templates/FUA_logo.png',
            // content: 'png',
            cid: 'image_cid',
            encoding: 'base64',
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  }

  async sendUserResetPassword(user: User, token: string) {
    const url = `https://www.fatihua.com/auth/confirm?token=${token}`;

    await this.mailerService.sendMail({
      to: user.email,
      from: '"Support Team" <support@example.com>', // override default from
      subject: 'Reset Password',
      template: './confirmation', // `.hbs` extension is appended automatically
      context: {
        // ✏️ filling curly brackets with content
        name: user.name,
        url,
      },
    });
  }

  async sendMailSandBox(email: any): Promise<void> {
    console.error('LAHHHH');
    console.log(__dirname, '/templates/notification.pug');
    const templateFile = path.join(__dirname, '/templates/notification.pug');
    const fileImg = path.join(__dirname, '/templates/FUA_logo.png');
    const socialMediaImg = path.join(__dirname, '/templates/FUA_logo.png');

    // const templateFile = __dirname + '/templates/notification.pug';
    // const fileImg = __dirname + '/templates/FUA_logo.png';
    // const socialMediaImg = __dirname + '/templates/FUA_logo.png';
    const imageData = readFileSync(fileImg).toString('base64');
    const imageDataSocialMedia =
      readFileSync(socialMediaImg).toString('base64');

    const data = {
      title: 'My title',
      img: imageData,
      myDescription: 'description',
      imgSocial: imageDataSocialMedia,
    };
    console.log(data);
    const render = this._bodytemplete(templateFile, data);
    console.log(templateFile);
    await this._processSendEmail(email.to, email.subject, email.text, render);
  }

  async sendMail(datamailer): Promise<void> {
    const render = this._bodytemplete(
      datamailer.templete,
      datamailer.dataTemplete,
    );
    await this._processSendEmail(
      datamailer.to,
      datamailer.subject,
      datamailer.text,
      render,
    );
  }

  _bodytemplete(templete, data) {
    return pug.renderFile(templete, { data });
  }

  async _processSendEmail(to, subject, text, body): Promise<void> {
    await this.mailerService
      .sendMail({
        to: to,
        subject: subject,
        text: text,
        html: body,
      })
      .then(() => {
        console.log('Email sent');
      })
      .catch((e) => {
        console.log('Error sending email', e);
      });
  }
}
