import dotenv from 'dotenv';
dotenv.config();

async function testEmail() {
  try {
    const { transporter } = await import('./src/services/nodemailer.service.js');
    console.log("Transporter user:", transporter.transporter?.auth?.user || transporter.options?.auth?.user);
    
    const res = await transporter.sendMail({
      from: '"Sistema Glamping" <glampinglosbosques9@gmail.com>',
      to: process.env.EMAIL_USER,
      subject: 'Test Email',
      html: '<h1>Test</h1>'
    });
    console.log("Email sent!", res);
  } catch (err) {
    console.error("Error sending email:", err);
  } finally {
    process.exit(0);
  }
}

testEmail();
