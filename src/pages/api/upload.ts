import { NextApiRequest, NextApiResponse } from "next";
import { imagekit } from "@/utils";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  // Parse multipart form data
  const formidable = require("formidable");
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: any, fields: any, files: any) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }
    const file = files.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const fs = require("fs");
    const fileBuffer = fs.readFileSync(file.filepath);
    try {
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: file.originalFilename,
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Upload failed", error });
    }
  });
}
