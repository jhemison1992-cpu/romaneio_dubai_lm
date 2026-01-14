import { Request, Response } from "express";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export async function handleUploadPlanta(req: Request, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Nenhum arquivo enviado" });
    }

    const file = req.file;
    
    // Validar tipo de arquivo
    if (file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Apenas arquivos PDF são permitidos" });
    }

    // Upload para S3
    const fileKey = `plantas/${nanoid()}-${file.originalname}`;
    const { url } = await storagePut(fileKey, file.buffer, file.mimetype);

    res.json({
      fileKey,
      fileUrl: url,
    });
  } catch (error) {
    console.error("Erro ao fazer upload da planta:", error);
    res.status(500).json({ error: "Erro ao fazer upload da planta" });
  }
}
