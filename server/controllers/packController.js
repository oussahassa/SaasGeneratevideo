import sql from "../configs/db.js";

// Vérifier le statut admin
const checkAdminStatus = async (userId) => {
  try {
    const user = await sql`
      SELECT is_admin FROM users WHERE id = ${userId}
    `;
    return user.length > 0 && user[0].is_admin === true;
  } catch (error) {
    return false;
  }
};

// Récupérer tous les packs
export const getAllPacks = async (req, res) => {
  try {
    const packs = await sql`
      SELECT * FROM packs ORDER BY price ASC
    `;
    res.json({ success: true, packs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Récupérer un pack spécifique
export const getPackById = async (req, res) => {
  try {
    const { id } = req.params;

    const pack = await sql`
      SELECT * FROM packs WHERE id = ${id}
    `;

    if (!pack.length) {
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

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const pack = await sql`
      INSERT INTO packs (name, description, price, features, monthly_limit)
      VALUES (
        ${name},
        ${description},
        ${price},
        ${JSON.stringify(features || [])}::jsonb,
        ${monthly_limit}
      )
      RETURNING *
    `;

    res.json({
      success: true,
      message: "Pack created successfully",
      pack: pack[0],
    });

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

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const pack = await sql`
      UPDATE packs
      SET
        name = COALESCE(${name}, name),
        description = COALESCE(${description}, description),
        price = COALESCE(${price}, price),
        features = COALESCE(${features ? JSON.stringify(features) : null}::jsonb, features),
        monthly_limit = COALESCE(${monthly_limit}, monthly_limit)
      WHERE id = ${id}
      RETURNING *
    `;

    if (!pack.length) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    res.json({
      success: true,
      message: "Pack updated successfully",
      pack: pack[0],
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer un pack (ADMIN)
export const deletePack = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized access" });
    }

    const deleted = await sql`
      DELETE FROM packs WHERE id = ${id}
      RETURNING id
    `;

    if (!deleted.length) {
      return res.status(404).json({ success: false, message: "Pack not found" });
    }

    res.json({
      success: true,
      message: "Pack deleted successfully",
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
