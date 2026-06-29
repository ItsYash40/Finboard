import jwt from "jsonwebtoken";
import { getServiceEnv } from "@finboard/config";

export function signJwt(user) {
  const env = getServiceEnv();
  return jwt.sign(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

export function verifyJwt(token) {
  const env = getServiceEnv();
  return jwt.verify(token, env.jwtSecret);
}

