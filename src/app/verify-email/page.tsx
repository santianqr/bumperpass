import { db } from "@/server/db";

type VerifyEmailProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function VerifyEmail({ searchParams }: VerifyEmailProps) {
  if (searchParams.token) {
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        token: searchParams.token as string,
      },
      include: {
        user: true,
      },
    });
    if (!verificationToken) {
      return <div>Invalid token</div>;
    }

    await db.user.update({
      where: {
        id: verificationToken.user.id as string,
      },
      data: {
        emailVerified: new Date(),
        verified: true,
      },
    });

    await db.verificationToken.delete({
      where: {
        token: searchParams.token as string,
      },
    });

    return (
      <div>
        <h1>
          Email verified for <b>{verificationToken.user.email}</b>!
        </h1>
      </div>
    );
  } else {
    return (
      <div>
        <h1>Verify Email</h1>
        No email verification token found. Check your email.
      </div>
    );
  }
}
