const { google } = require('googleapis'); // this is  for google api
const OAuth2 = google.auth.OAuth2; // this is for google sign option or authorisatiion
const nodemailer = require('nodemailer'); // this is for sending mails 

const CLIENT_ID = '139677871484-6f647up985lh5kvdoptkpsfs22eb6kqd.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URL = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//041IeL--SqBHjCgYIARAAGAQSNwF-L9Irvb4m9Tgfxu9kzMmJAhS1DtaYPS13Ou0OfOHDhJJvWJa_EAlM65BEwoXT6WXHVlz96Ss';

const oAuth2Client = new OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URL
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function checkForNewEmails() {
    try {
        const accessToken = await oAuth2Client.getAccessToken();
        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'harshitraj4498@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });
        const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

        const res = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread',
            labelIds: ['INBOX']
        });
        const emails = res.data.messages;

        for (const email of emails) {
            const message = await gmail.users.messages.get({
                userId: 'me',
                id: email.id,
                format: 'full'
            });

            const labelIds = message.data.labelIds;
            const isReplied = labelIds.includes('SENT') || labelIds.includes('REPLIED');
            const isInbox = labelIds.includes('INBOX');
 // checking weather replied or not  and inbox 
            if (!isReplied && isInbox) {
                const from = message.data.payload.headers.find(header => header.name === 'From').value;
                const subject = message.data.payload.headers.find(header => header.name === 'Subject').value;
                const text = `Dear ${from},\n\nThank you for your email regarding your issue "${subject}". We have received your message and will respond as soon as possible.\n\nBest regards,\nHarshit`;

                const mailOptions = {
                    from: 'Harshit raj  <harhsitraj4498@gmail.com>',
                    to: from,
                    subject: 'Thank you for your email',
                    text:"hey thanks",
                    html: `<p>${ text }</p>`,
                };

                const result = await transport.sendMail(mailOptions);
                console.log('Email sent...', result);

                await gmail.users.messages.modify({
                    userId: 'me',
                    id: message.data.id,
                    requestBody: {
                        removeLabelIds: ['INBOX'],
                        addLabelIds: ['SENT', 'REPLIED']
                    }
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
}

checkForNewEmails();
 // i can improve in code redablity, maintaiblity and accuracy i can alse add  more features but to be honnest i need to learn more 
 // i use google api and nodemailer 