import type { Request, Response } from "express";

const handleHealth = async (req: Request, res: Response) => {
  res.send("Hello World");
};

export { handleHealth };
