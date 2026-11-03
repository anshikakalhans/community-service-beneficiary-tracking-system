import emailjs from "@emailjs/browser";

export const sendThankYouEmail = async ({
  donorName,
  donorEmail,
  amount,
  cause,
}) => {
  const templateParams = {
    donor_name: donorName || "Dear Donor",
    donor_email: donorEmail,
    donation_amount: amount,
    cause_name: cause,
    donation_date: new Date().toLocaleDateString("en-IN"),
  };

  return await emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams,
    {
      publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
    }
  );
};