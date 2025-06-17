exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  try {
    const RESEND_API_KEY = "re_XyNgqnjg_6ahkem3akVAtRQhwhsiqDzN1"; // Replace with your real key
    const templateUrl = "https://lovely-malabi-0895dc.netlify.app/templates/email/letter_approved.html";

    // Parse POST body
    const data = JSON.parse(event.body);
    const firstName = data.firstName || "Friend";
    const email = data.email;
    const letterContent = data.letterContent || "";
    const moderatorComments = data.moderatorComments || "";
    const letterID = data.letterID || "";

    // Build the public URL dynamically
    const publicUrl = `https://walkerjames.life/letters/view/${letterID}`;
    const fromEmail = "letters@email.walkerjames.life";

    // Fetch the email template
    const response = await fetch(templateUrl);
    const htmlTemplate = await response.text();

    // Merge dynamic content into template
    const mergedHtml = htmlTemplate
      .replace(/{{name}}/g, firstName)
      .replace(/{{letter}}/g, letterContent)
      .replace(/{{moderator_comment}}/g, moderatorComments)
      .replace(/{{public_url}}/g, publicUrl);

    // Send email via Resend
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [email],
        subject: "Your Letter Has Been Approved",
        html: mergedHtml,
      }),
    });

    const result = await resendResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email sent!", details: result }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to send email", error: error.message }),
    };
  }
};
