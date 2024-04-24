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
    <div
      style={{
        background: "linear-gradient(to right, #F59F0F, #E62534)",
        color: "white",
        padding: "6px",
      }}
    >
      <h3>Hello, {name}! You are almost there!</h3>
    </div>
    <div>
      <p>
        Please confirm your suscription
        <br />
        You are one step way from activating your account
      </p>
    </div>

    <a
      href={`https://www.bumperpass.com/verify-email?token=${token}`}
      //href={`http://localhost:3000/verify-email?token=${token}`}
    >
      <button
        style={{
          backgroundColor: "#E62534",
          color: "white",
          textAlign: "center",
          textDecoration: "none",
          cursor: "pointer",
          borderRadius: "8px",
          padding: "6px 4px",
          fontWeight: "bold",
          border: "1px solid #FFFFFF",
        }}
      >
        Confirm E-mail
      </button>
    </a>
    <p>
      Bumperpass will process your data to send you information about our
      products, services, promotions, surveys and giveaways based on our
      legitimate interest. Your data will not be communicated to third parties.
    </p>
    <table>
      <tr>
        <td style={{ paddingRight: "40px" }}>
          <img
            src="https://raw.githubusercontent.com/santianqr/bumperpass/main/public/logo.png"
            alt="logo_bumperpass"
            style={{ width: "180px", height: "70px" }}
          />
        </td>
        <td>
          <div>
            <p style={{ marginBottom: "2px" }}>Bumperpass website:</p>
            <a href="www.bumperpass.com">www.bumperpass.com</a>
          </div>
          <div>
            <p>
              @Bumperpass
              <br />
              contact@bumperpass.com
            </p>
          </div>
        </td>
      </tr>
    </table>
  </div>
);
