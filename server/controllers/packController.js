import sql from "../configs/db.js";
import { clerkClient } from "@clerk/express";

// Récupérer tous les packs
export const getAllPacks = async (req, res) => {
  try {
    const packs = await sql`SELECT * FROM packs ORDER BY price ASC`;
    res.json({ success: true, packs });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Récupérer un pack spécifique
export const getPackById = async (req, res) => {
  try {
    const { id } = req.params;
    const [pack] = await sql`SELECT * FROM packs WHERE id = ${id}`;

    if (!pack) {
      return res.json({ success: false, message: "Pack not found" });
    }

    res.json({ success: true, pack });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Créer un nouveau pack (ADMIN)
export const createPack = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { name, description, price, features, monthly_limit } = req.body;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const [pack] = await sql`
      INSERT INTO packs (name, description, price, features, monthly_limit)
      VALUES (${name}, ${description}, ${price}, ${JSON.stringify(features)}, ${monthly_limit})
      RETURNING *
    `;

    res.json({ success: true, message: "Pack created successfully", pack });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Mettre à jour un pack (ADMIN)
export const updatePack = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;
    const { name, description, price, features, monthly_limit } = req.body;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    const [pack] = await sql`
      UPDATE packs 
      SET name = ${name}, 
          description = ${description}, 
          price = ${price}, 
          features = ${JSON.stringify(features)},
          monthly_limit = ${monthly_limit}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!pack) {
      return res.json({ success: false, message: "Pack not found" });
    }

    res.json({ success: true, message: "Pack updated successfully", pack });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Supprimer un pack (ADMIN)
export const deletePack = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { id } = req.params;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.json({ success: false, message: "Unauthorized access" });
    }

    await sql`DELETE FROM packs WHERE id = ${id}`;

    res.json({ success: true, message: "Pack deleted successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Vérifier le statut admin
const checkAdminStatus = async (userId) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return user.publicMetadata?.isAdmin === true;
  } catch (error) {
    return false;
  }
};
