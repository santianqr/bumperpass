import * as React from "react";

interface EmailForgotPasswordProps {
  name: string;
  token: string;
}

export const EmailForgotPassword: React.FC<
  Readonly<EmailForgotPasswordProps>
> = ({ name, token }) => (
  <div>
    <div
      style={{
        background: "linear-gradient(to right, #F59F0F, #E62534)",
        color: "white",
        padding: "6px",
      }}
    >
      <h3>Hello, {name}! We received a request to reset your password</h3>
    </div>
    <div>
      <p>
        Please follow the below to reset your password. Keep in mind it will{" "}
        remain active for only 24 hours. If the link expires, you will need to
        request another one, starting the registrarion process again.
      </p>
      <p>
        If you didnt request a password change, you can disregard this email,{" "}
        and your password wont be altered.
      </p>
    </div>

    <a
      //href={`https://www.bumperpass.com/reset-password?token=${token}`}
      href={`http://localhost:3000/reset-password?token=${token}`}
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
        Reset password
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
