// Type augmentation for Express Request to include `user` set by auth middleware.
// Using module augmentation for `express-serve-static-core` so all imports of Request see this shape.

export {};

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uid: string;
      email?: string;
      role?: string;
    };
  }
}