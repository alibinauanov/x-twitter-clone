import { NextApiRequest, NextApiResponse } from "next";
import { imagekit } from "@/utils";
import formidable from "formidable";
import fs from "fs";

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
  const form = new formidable.IncomingForm();

  form.parse(req, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
    if (err) {
      return res.status(500).json({ message: "Error parsing form data" });
    }
    
    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    
    const fileBuffer = fs.readFileSync(file.filepath);
    try {
      const result = await imagekit.upload({
        file: fileBuffer,
        fileName: file.originalFilename || "upload",
      });
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ message: "Upload failed", error });
    }
  });
}
