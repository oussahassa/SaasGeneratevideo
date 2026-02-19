import sql from "../configs/db.js";

// ===== Helper function =====
const checkAdminStatus = async (userId) => {
  try {
    const user = await sql`
      SELECT is_admin FROM users WHERE id = ${userId}
    `;
    return user.length > 0 && user[0].is_admin === true;
  } catch {
    return false;
  }
};

// ===== FAQ FUNCTIONS =====

// Récupérer toutes les FAQ
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await sql`
      SELECT * FROM faqs ORDER BY category, order_index ASC
    `;
    res.json({ success: true, faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Créer une FAQ (ADMIN)
export const createFAQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { question, answer, category } = req.body;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const faq = await sql`
      INSERT INTO faqs (question, answer, category)
      VALUES (${question}, ${answer}, ${category})
      RETURNING *
    `;

    // Async translation trigger (best-effort)
    try {
      const fetch = (await import('node-fetch')).default
      const apiUrl = `${process.env.VITE_API_URL || process.env.API_URL || ''}/api/translate/translate-and-save`
      fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${req.headers.authorization?.split(' ')[1] || ''}` },
        body: JSON.stringify({ entityType: 'faq', entityId: faq[0].id, sourceLocale: 'fr', fields: { question, answer } })
      }).catch(() => {})
    } catch (e) {
      // ignore
    }

    res.json({ success: true, message: "FAQ created successfully", faq: faq[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour une FAQ (ADMIN)
export const updateFAQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { question, answer, category } = req.body;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const faq = await sql`
      UPDATE faqs
      SET
        question = COALESCE(${question}, question),
        answer = COALESCE(${answer}, answer),
        category = COALESCE(${category}, category),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;

    if (!faq.length)
      return res.status(404).json({ success: false, message: "FAQ not found" });

    res.json({ success: true, message: "FAQ updated successfully", faq: faq[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer une FAQ (ADMIN)
export const deleteFAQ = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const deleted = await sql`
      DELETE FROM faqs WHERE id = ${id} RETURNING id
    `;

    if (!deleted.length)
      return res.status(404).json({ success: false, message: "FAQ not found" });

    res.json({ success: true, message: "FAQ deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== COMPLAINT FUNCTIONS =====

// Créer une réclamation
export const createComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, priority } = req.body;

    const complaint = await sql`
      INSERT INTO complaints (user_id, title, description, category, priority, status)
      VALUES (${userId}, ${title}, ${description}, ${category}, ${priority || "medium"}, 'open')
      RETURNING *
    `;

    res.json({ success: true, message: "Complaint submitted successfully", complaint: complaint[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Réclamations utilisateur
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const complaints = await sql`
      SELECT * FROM complaints
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    res.json({ success: true, complaints });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toutes les réclamations (ADMIN)
export const getAllComplaints = async (req, res) => {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const complaints = await sql`
      SELECT c.*, u.email, u.first_name, u.last_name
      FROM complaints c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
    `;

    res.json({ success: true, complaints });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mettre à jour statut réclamation (ADMIN)
export const updateComplaintStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status, response } = req.body;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const complaint = await sql`
      UPDATE complaints
      SET
        status = ${status},
        admin_response = ${response || null},
        resolved_at = CASE WHEN ${status} = 'resolved' THEN NOW() ELSE resolved_at END
      WHERE id = ${id}
      RETURNING *
    `;

    if (!complaint.length)
      return res.status(404).json({ success: false, message: "Complaint not found" });

    res.json({ success: true, message: "Complaint updated successfully", complaint: complaint[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Supprimer réclamation (ADMIN)
export const deleteComplaint = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const deleted = await sql`
      DELETE FROM complaints WHERE id = ${id} RETURNING id
    `;

    if (!deleted.length)
      return res.status(404).json({ success: false, message: "Complaint not found" });

    res.json({ success: true, message: "Complaint deleted successfully" });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Statistiques réclamations (ADMIN)
export const getComplaintsStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const isAdmin = await checkAdminStatus(userId);
    if (!isAdmin)
      return res.status(403).json({ success: false, message: "Unauthorized access" });

    const stats = await sql`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_count,
        SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as high_priority_count
      FROM complaints
    `;

    res.json({ success: true, stats: stats[0] });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
