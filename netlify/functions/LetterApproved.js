exports.handler = async (event) => {
  const RESEND_API_KEY = "re_XyNgqnjg_6ahkem3akVAtRQhwhsiqDzN1"; // Replace with your real key
  const templateUrl = "https://lovely-malabi-0895dc.netlify.app/templates/email/letter_approved.html";

  // Sample data for testing – you can replace this later with dynamic input
  const name = "Walker James";
  const letter = "Thank you for reading my letter. I’m so grateful for the opportunity to share.";
  const moderatorComment = "This letter was beautiful. It deeply touched our review team.";
  const publicUrl = "https://walkerjames.life/letters/view/123";
  const toEmail = "jimwalker29@gmail.com"; // Replace with your email for testing
  const fromEmail = "letters@email.walkerjames.life";

  try {
    const response = await fetch(templateUrl);
    const htmlTemplate = await response.text();

    const mergedHtml = htmlTemplate
      .replace(/{{name}}/g, name)
      .replace(/{{letter}}/g, letter)
      .replace(/{{moderator_comment}}/g, moderatorComment)
      .replace(/{{public_url}}/g, publicUrl);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: "Your Letter Has Been Approved",
        html: mergedHtml
      })
    });

    const result = await resendResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Email sent!",
        details: result
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Error sending email",
        error: error.message,
      }),
    };
  }
};
