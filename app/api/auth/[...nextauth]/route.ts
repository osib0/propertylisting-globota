import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";  // Adjust path if needed
import UserModel from "@/model/user.model";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "Phone OTP",
      credentials: {
        phone: { label: "Phone", type: "text" },
        otp: { label: "OTP", type: "text" },
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

        // TODO: Sign S3 URL if needed
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
            profile_image,  // Use signed URL if implemented
          };
        }

        // Phone/OTP path: ADD OTP VALIDATION HERE (e.g., check Redis/session)
        // For now, it returns without validation—fix to prevent bypass
        if (!id && !email && !phone) return null;
        // Example: const isValidOtp = await validateOtp(phone, otp);
        // if (!isValidOtp) return null;
        return { id, email, first_name, last_name, phone, profile_image };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.id = user.id;
        token.phone = user.phone;
        token.email = user.email ?? token.email ?? null;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.profile_image = user.profile_image;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id ?? "",
          phone: token.phone ?? session.user?.phone,
          email: token.email ?? session.user?.email ?? null,
          name:
            session.user?.name ??
            [token.first_name, token.last_name].filter(Boolean).join(" "),
          image: session.user?.image ?? token.profile_image,
          first_name: token.first_name ?? undefined,
          last_name: token.last_name ?? undefined,
          profile_image: token.profile_image ?? undefined,
        },
      };
    },
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers } = NextAuth(authOptions);
export const { GET, POST } = handlers;