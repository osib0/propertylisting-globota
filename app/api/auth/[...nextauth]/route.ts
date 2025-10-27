// @ts-nocheck
/* eslint-disable */
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
        // You’re also using email/password in the same authorize()
        // which is fine; they’ll come via credentials.
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
        id: { label: "ID", type: "text" },
        first_name: { label: "First Name", type: "text" },
        last_name: { label: "Last Name", type: "text" },
        profile_image: { label: "Profile Image", type: "text" },
      },
      async authorize(credentials: any) {
        await dbConnect();

        let {
          id,
          email,
          first_name,
          last_name,
          phone,
          profile_image,
          password,
        } = credentials || {};

        // If you later want to sign the S3 URL, do it here
        // if (profile_image) {
        //   const fileKey = `private/${id}/${profile_image}`;
        //   profile_image = await getS3SignedUrl(fileKey, 3600);
        // }

        if (password) {
          // Email/password path
          const user = await UserModel.findOne({ email });

          if (!user || !user.password) return null;

          const isMatch = await bcrypt.compare(password, user.password);
          if (!isMatch) return null;

          return {
            id: user._id.toString(),
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            profile_image,
          };
        }

        // Phone/OTP path (you’ll likely validate OTP separately)
        if (!id && !email && !phone) return null; // basic sanity
        return { id, email, first_name, last_name, phone, profile_image };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, copy fields from `user` into the token
      if (user) {
        token.id = (user as any).id;
        token.phone = (user as any).phone;
        token.email = (user as any).email ?? token.email ?? null;
        token.first_name = (user as any).first_name;
        token.last_name = (user as any).last_name;
        token.profile_image = (user as any).profile_image;
      }
      return token;
    },
    async session({ session, token }) {
      // Return a NEW session object; don’t mutate possibly-undefined session.user
      return {
        ...session,
        user: {
          ...session.user, // may be undefined; spread safely handled by TS with augmentation
          id: (token.id as string) ?? "",
          phone: (token.phone as string | undefined) ?? session.user?.phone,
          email: (token.email as string | null) ?? session.user?.email ?? null,
          name:
            session.user?.name ??
            [token.first_name, token.last_name].filter(Boolean).join(" "),
          image:
            session.user?.image ??
            (token.profile_image as string | undefined),
          first_name: (token.first_name as string | undefined) ?? undefined,
          last_name: (token.last_name as string | undefined) ?? undefined,
          profile_image:
            (token.profile_image as string | undefined) ?? undefined,
        },
      };
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export const GET = handler as any;
export const POST = handler as any;

