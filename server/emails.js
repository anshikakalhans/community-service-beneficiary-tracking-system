const esc = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const rupees = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function layout(ngoName, body) {
  return `<!doctype html><html><body style="margin:0;background:#f6f7fc;font-family:Arial,Helvetica,sans-serif;color:#16193a">
  <div style="max-width:560px;margin:0 auto;padding:28px 16px">
    <div style="background:#ffffff;border:1px solid #e4e6f2;border-radius:16px;overflow:hidden">
      <div style="background:#2f3a8f;color:#ffffff;padding:22px 26px;font-size:20px;font-weight:bold">${esc(ngoName)}</div>
      <div style="height:4px;background:#e23a2f"></div>
      <div style="padding:26px;line-height:1.65;font-size:15px">${body}</div>
    </div>
    <p style="text-align:center;color:#8a8fae;font-size:12px;margin-top:16px">An Education Trust</p>
  </div></body></html>`;
}

const button = (href, label) =>
  `<p style="text-align:center;margin:26px 0"><a href="${esc(href)}" style="background:#e23a2f;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:bold">${esc(label)}</a></p>`;

export function thankYouEmail({ ngoName, frontendUrl, donorName, amount, cause, date }) {
  const link = `${frontendUrl}/#/delivery-proof`;
  const subject = `Thank you for your donation to ${ngoName}`;
  const html = layout(
    ngoName,
    `<p>Dear ${esc(donorName)},</p>
     <p>Thank you for donating <b>${rupees(amount)}</b> towards <b>${esc(cause)}</b> on ${esc(date)}.
     ${esc(ngoName)} is truly thankful for your kindness and generosity.</p>
     <p>Once your donation reaches the people in need, you will be able to see the photo in the
     <b>Delivery Proof</b> section.</p>
     ${button(link, "View Delivery Proof")}
     <p>With gratitude,<br/>${esc(ngoName)}</p>`,
  );
  const text = `Dear ${donorName},\n\nThank you for donating ${rupees(amount)} towards ${cause} on ${date}. ${ngoName} is truly thankful for your donation.\n\nOnce it is delivered you can see the photo here: ${link}\n\nWith gratitude,\n${ngoName}`;
  return { subject, html, text };
}

export function proofUploadedEmail({ ngoName, frontendUrl, donorName, amount, cause, beneficiary }) {
  const link = `${frontendUrl}/#/delivery-proof`;
  const subject = `Your donation has reached its destination - ${ngoName}`;
  const html = layout(
    ngoName,
    `<p>Dear ${esc(donorName)},</p>
     <p>Good news! Your donation of <b>${rupees(amount)}</b> for <b>${esc(cause)}</b> has been delivered
     (received by <b>${esc(beneficiary)}</b>). A delivery photo is now available for you to see.</p>
     ${button(link, "See the delivery photo")}
     <p>Thank you for making a difference.<br/>${esc(ngoName)}</p>`,
  );
  const text = `Dear ${donorName},\n\nYour donation of ${rupees(amount)} for ${cause} has been delivered (received by ${beneficiary}). See the photo: ${link}\n\n${ngoName}`;
  return { subject, html, text };
}
