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
    <div>
      <h3>
        Hello, {name}!
      </h3>
      <h3>
        Youre almost there!
      </h3>
    </div>
    <div>
      <p>Please confirm your suscription</p>
      <p>You are one step way from</p>
      <p>activating your account</p>
    </div>

    <a
      href={`https://www.bumperpass.com/verify-email?token=${token}`}
    >
      <button>Confirm E-mail</button>
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
          <div>
            @Bumperpass
          </div>
          <div>
            contact@bumperpass.com
          </div>
        </div>
      </div>
    </div>
  </div>
);
