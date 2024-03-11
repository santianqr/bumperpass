import * as React from "react";

interface EmailForgotPasswordProps {
  name: string;
  token: string;
}

export const EmailForgotPassword: React.FC<Readonly<EmailForgotPasswordProps>> = ({
  name,
  token,
}) => (
  <div>
    <h1>Hi, {name}!</h1>
    <p>Please, click on this link to reset your password on Bumperpass:</p>
    <a href={`https://h3maejcadh.us-east-1.awsapprunner.com/reset-password?token=${token}`}>
      Click on me!
    </a>
  </div>
);
