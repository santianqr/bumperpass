import { RegisterComplement } from "@/components/register-complement";
import { db } from "@/server/db";
import type { User, VerificationToken } from "@prisma/client";

type VerifyEmailProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function VerifyEmail({ searchParams }: VerifyEmailProps) {
  if (searchParams.token) {
    const verificationToken = (await db.verificationToken.findUnique({
      where: {
        token: searchParams.token as string,
      },
      include: {
        user: true,
      },
    })) as VerificationToken & { user: User };

    if (!verificationToken) {
      return <div>Invalid token</div>;
    }

    if (new Date() > verificationToken.expires) {
      return <div>Your token has expired</div>;
    }

    await db.user.update({
      where: {
        id: verificationToken.user.id,
      },
      data: {
        emailVerified: new Date(),
      },
    });
    {
      /*}
    await db.verificationToken.delete({
      where: {
        token: searchParams.token as string,
      },
    });
  */
    }
    return (
      <div className="space-y-8">
        <h3 className="text-center">
          Email verified for <b>{verificationToken.user.email}</b>!
          
        </h3>
        <RegisterComplement token={verificationToken.token} />
      </div>
    );
  } else {
    return (
      <div>
        <h3>Verify Email</h3>
        No email verification token found. Check your email.
      </div>
    );
  }
}
