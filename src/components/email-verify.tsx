import * as React from "react";

interface EmailVerifyProps {
  name: string;
  token: string;
}

export const EmailVerify: React.FC<Readonly<EmailVerifyProps>> = ({
  name,
  token,
}) => (
  <div>
    <h1>Welcome to Bumperpass, {name}!</h1>
    <p>Please, click on this link to activate your account on Bumperpass:</p>
    <a href={`http://localhost:3000/verify-email?token=${token}`}>
      Click on me!
    </a>
  </div>
);
