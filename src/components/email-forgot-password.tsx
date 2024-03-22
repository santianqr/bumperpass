import * as React from "react";

interface EmailForgotPasswordProps {
  name: string;
  token: string;
}

export const EmailForgotPassword: React.FC<
  Readonly<EmailForgotPasswordProps>
> = ({ name, token }) => (
  <div>
    <div>
      <h3>Hello, {name}!</h3>
      <h3>We received a request to reset your password</h3>
    </div>
    <div>
      <p>
        Please follow the below to reset your password. Keep in mind it will{" "}
        remain active for only 24 hours. If the link expires, you will need to
        request another one, starting the registrarion process again.
      </p>
      <p>
        If you didnt request a password change, you can disregard this email,{" "}
        and your password wont be alteres.
      </p>
    </div>

    <a href={`https://www.bumperpass.com/reset-password?token=${token}`}>
      <button>Reset password</button>
    </a>
    <p>
      Bumperpass will process your data to send you information about our
      products, services, promotions, surveys and giveaways based on our
      legitimate interest. Your data will not be communicated to third parties.
    </p>
    <div>
      <div>
        <p>Bumperpass</p>
        <p>www.bumperpass.com</p>
      </div>
      <div>
        <div>
          <div>@Bumperpass</div>

          <div>contact@bumperpass.com</div>
        </div>
      </div>
    </div>
  </div>
);
