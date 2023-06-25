import API from "../../../lib/axios/index";
import { NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
// db collections
const Users = prisma.user;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // 1) use the code to get token from github
  let githubToken: string | undefined;
  {
    const body = {
      client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      redirect_uri: process.env.GITHUB_REIRECT_URL,
      code,
    };
    const headers = {
      Accept: "application/json",
    };
    const res = await API.POST("https://github.com/login/oauth/access_token", headers, body);
    githubToken = res?.access_token;
  }
  // 2) use the github token to get user details
  const userWithNameAndEmail = Prisma.validator<Prisma.UserArgs>()({
    select: { email: true, name: true },
  });
  type userDTO = Prisma.UserGetPayload<typeof userWithNameAndEmail> & {
    emails: string[];
  };
  let user: userDTO;
  {
    user = await API.GET("https://api.github.com/user", {
      Authorization: `Bearer ${githubToken}`,
    });
    if (user.email === null) {
      const emails = await API.GET("https://api.github.com/user/emails", {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${githubToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
      });
      let userPrimaryEmail: string;
      // check if we have an user record with any of the emails , if we do then the user is not new and he is just signing in, if not then the user is new and we need to save his details in db. In this flow we need to update the user record with the new primary email if the user has changed his primary email in github
      userPrimaryEmail = emails?.find((email: any) => email.primary === true)?.email;
      user.email = userPrimaryEmail;
      user.emails = emails.map((x: any) => x.email);
    } else {
      user.emails = [user.email];
    }
  }
  // 3) update or create user details in db
  let userRecord: Prisma.UserGetPayload<true> | null;
  {
    userRecord = await Users.findFirst({
      where: {
        email: {
          in: user.emails,
        },
      },
    });
    if (userRecord) {
      // update user record with new email
      if (userRecord.email !== user.email) {
        await Users.update({
          where: {
            id: userRecord?.id,
          },
          data: {
            email: user.email,
          },
        });
      }
    } else {
      // save user details in db
      userRecord = await Users.create({
        data: {
          name: user.name,
          email: user.email,
        }
      });
    }
  }
  // 4) set jwt token in cookie and redirect to home page
  let response: NextResponse;
  {
    const userId = userRecord?.id;
    const jwtToken = jwt.sign({ sub: userId }, process.env.JWT_SECRET as string, {
      expiresIn: "10d",
    });
    response = NextResponse.redirect("http://localhost:3000/profile", 302);
    response.cookies.set("token", jwtToken, { path: "/", httpOnly: true });
  }
  return response;
}
