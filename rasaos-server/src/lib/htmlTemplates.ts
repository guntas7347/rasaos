const layout = ({ content = "" }) => `
  <div
    style="
      background-color: #f5f5f5;
      padding: 40px 16px;
      font-family: Arial, sans-serif;
      color: #111827;
    "
  >
    <div
      style="
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
      "
    >
      <div
        style="
          background-color: #111827;
          padding: 24px;
          text-align: center;
        "
      >
        <a
          href="https://rasaos.com"
          style="
            color: #ffffff;
            font-size: 28px;
            font-weight: bold;
            text-decoration: none;
          "
        >
          RasaOS
        </a>
      </div>

      <img
        src="https://images.pexels.com/photos/28674566/pexels-photo-28674566.jpeg"
        alt="RasaOS"
        style="
          width: 100%;
          height: 240px;
          object-fit: cover;
          display: block;
        "
      />

      <div
        style="
          padding: 32px 24px;
          line-height: 1.7;
          font-size: 15px;
        "
      >
        ${content}
      </div>

      <div
        style="
          background-color: #f9fafb;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #6b7280;
          border-top: 1px solid #e5e7eb;
        "
      >
        © ${new Date().getFullYear()} RasaOS<br />

        <a
          href="https://rasaos.com"
          style="
            color: #111827;
            text-decoration: none;
          "
        >
          rasaos.com
        </a>
      </div>
    </div>
  </div>
`;

export const verificationEmail = ({ verificationLinkUrl = "" }) =>
  layout({
    content: `
      <h2
        style="
          margin-top: 0;
          margin-bottom: 16px;
          text-align: center;
        "
      >
        Complete Your Registration
      </h2>

      <p style="margin-bottom: 24px; text-align: center;">
        Click the button below to complete your registration.
      </p>

      <div style="text-align: center; margin-bottom: 32px;">
        <a
          href="${verificationLinkUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background-color: #111827;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Complete Registration
        </a>
      </div>
    `,
  });

export const welcomeEmail = ({
  email = "",
  restaurantSlug = "",
  isSlugChanged = false,
  feUrl = "",
}) => {
  const slugMessage = isSlugChanged
    ? `
      <p style="margin-bottom: 8px;">
        The slug you chose was already taken, so we automatically assigned you a new one:
      </p>

      <p
        style="
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 24px;
        "
      >
        ${restaurantSlug}
      </p>
    `
    : `
      <p style="margin-bottom: 24px;">
        Your slug:
        <strong>${restaurantSlug}</strong>
      </p>
    `;

  return layout({
    content: `
      <h2 style="margin-top: 0; margin-bottom: 20px;">
        Your registration is complete
      </h2>

      <p style="margin-bottom: 16px;">
        <strong>Email:</strong> ${email}
      </p>

      ${slugMessage}

      <p style="margin-bottom: 16px;">
        To login, please reset your password first.
      </p>

      <p style="margin-bottom: 8px;">
        After resetting your password and logging in, complete your profile here:
      </p>

      <p style="word-break: break-word;">
        <a
          href="${feUrl}/restaurant/settings"
          style="
            color: #2563eb;
            text-decoration: none;
          "
        >
          ${feUrl}/restaurant/settings
        </a>
      </p>
    `,
  });
};

export const resetPasswordEmail = ({ resetLinkUrl = "" }) =>
  layout({
    content: `
      <h2
        style="
          margin-top: 0;
          margin-bottom: 16px;
          text-align: center;
        "
      >
        Reset Your Password
      </h2>

      <p
        style="
          margin-bottom: 24px;
          text-align: center;
        "
      >
        We received a request to reset your password.
        Click the button below to continue.
      </p>

      <div
        style="
          text-align: center;
          margin-bottom: 32px;
        "
      >
        <a
          href="${resetLinkUrl}"
          style="
            display: inline-block;
            padding: 14px 24px;
            background-color: #111827;
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="margin-bottom: 8px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
    `,
  });
