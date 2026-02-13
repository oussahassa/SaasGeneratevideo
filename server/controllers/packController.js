import sql from "../configs/db.js";

// Vérifier le statut admin
const checkAdminStatus = async (userId) => {
  try {
    const user = await sql('SELECT is_admin FROM users WHERE id = $1', [userId]);
    return user.length > 0 && user[0].is_admin === true;
  } catch (error) {
    return false;
  }
};

// Récupérer tous les packs
export const getAllPacks = async (req, res) => {
  try {
    const packs = await sql('SELECT * FROM packs ORDER BY price ASC');
    res.json({ success: true, packs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer un pack spécifique
export const getPackById = async (req, res) => {
  try {
    const { id } = req.params;
    const pack = await sql('SELECT * FROM packs WHERE id = $1', [id]);

    if (!pack || pack.length === 0) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    res.json({ success: true, pack: pack[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Créer un nouveau pack (ADMIN)
export const createPack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description, price, features, monthly_limit } = req.body;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const pack = await sql(
      'INSERT INTO packs (name, description, price, features, monthly_limit) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, price, JSON.stringify(features), monthly_limit]
    );

    res.json({ success: true, message: "Pack created successfully", pack: pack[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour un pack (ADMIN)
export const updatePack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, description, price, features, monthly_limit } = req.body;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const pack = await sql(
      `UPDATE packs 
       SET name = $1, description = $2, price = $3, features = $4, monthly_limit = $5
       WHERE id = $6
       RETURNING *`,
      [name, description, price, JSON.stringify(features), monthly_limit, id]
    );

    if (!pack || pack.length === 0) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    res.json({ success: true, message: "Pack updated successfully", pack: pack[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer un pack (ADMIN)
export const deletePack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Vérifier si l'utilisateur est admin
    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    await sql('DELETE FROM packs WHERE id = $1', [id]);

    res.json({ success: true, message: "Pack deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
