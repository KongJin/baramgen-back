import axios from "axios";
import { Request, Response } from "express";
import { client } from "../server";

export const loginUser = async (req: Request, res: Response) => {
  const { code } = req.body;
  try {
    const {
      data: { access_token },
    } = await axios.post(
      `https://oauth2.googleapis.com/token?code=${code}&client_id=${process.env.GOOGLE_CLIENT_ID}&client_secret=${process.env.GOOGLE_CLIENT_PASSWORD}&redirect_uri=http://localhost:3000/signin&grant_type=authorization_code`,
      {
        headers: { "content-type": "application/x-www-form-urlencoded" },
      },
      { withCredentials: true }
    );

    const {
      data: { email, picture: img },
    } = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${access_token}`, {
      headers: {
        authorization: `token ${access_token}`,
        accept: "application/json",
      },
    });

    let userInfo = await client.user.findUnique({
      where: { email },
    });

    if (!userInfo) {
      const nickname = Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(0, 5);

      await client.user.create({
        data: { email, nickname, img },
      });
    }

    return res.json({ token: access_token });
  } catch {
    return res.json({ token: false });
  }
};

export const readUser = async (req: Request, res: Response) => {
  try {
    return res.json({ userInfo: res.locals.userInfo });
  } catch {
    return res.json({ userInfo: false });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    let deleteUser = await client.user.delete({
      where: { email: res.locals.userInfo.email },
    });

    return res.json({ deleteUser });
  } catch {
    return res.json({ deleteUser: false });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { nickname } = req.body;
  try {
    let updatedUser = await client.user.update({
      where: {
        id: res.locals.userInfo.id,
      },
      data: {
        nickname,
      },
    });
    return res.json({ userInfo: updatedUser });
  } catch {
    return res.json({ userInfo: false });
  }
};

export const likeArticle = async (req: Request, res: Response) => {
  const { articleId } = req.body;
  try {
    let userInfo = res.locals.userInfo;

    if (userInfo) {
      const liked = await client.like.findMany({
        where: { userId: userInfo.id, articleId },
      });

      if (liked.length) {
        await client.like.deleteMany({ where: { userId: userInfo.id, articleId } });

        return res.json({ like: true });
      } else {
        await client.like.create({
          data: {
            article: { connect: { id: articleId } },
            user: { connect: { id: userInfo.id } },
          },
        });

        return res.json({ like: true });
      }
    }
  } catch {
    return res.json({ like: false });
  }
};
