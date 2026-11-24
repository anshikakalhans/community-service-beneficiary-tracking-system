export function createMailer(config) {
  let transporter = null;

  async function getTransporter() {
    if (!config.smtp.host || !config.smtp.user || !config.smtp.pass) return null;
    if (!transporter) {
      const { default: nodemailer } = await import("nodemailer");
      transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port,
        secure: config.smtp.port === 465,
        auth: { user: config.smtp.user, pass: config.smtp.pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });
    }
    return transporter;
  }

  return {
    async send({ to, subject, html, text }) {
      try {
        const smtp = await getTransporter();
        if (!smtp) {
          console.log(`[mail] SMTP not configured, email not sent. to=${to} subject="${subject}"`);
          return { sent: false, reason: "SMTP not configured" };
        }
        await smtp.sendMail({ from: config.mailFrom, to, subject, html, text });
        return { sent: true };
      } catch (error) {
        console.error("[mail] sending failed:", error.message);
        return { sent: false, reason: error.message };
      }
    },
  };
}
