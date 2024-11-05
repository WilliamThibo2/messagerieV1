const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

// Route pour supprimer le compte utilisateur
router.delete("/deleteAccount", async (req, res) => {
    try {
        const userId = req.user.id; // Assurez-vous que l'utilisateur est connecté et que son ID est accessible
        await User.findByIdAndDelete(userId);
        res.json({ success: true });
    } catch (error) {
        console.error("Erreur lors de la suppression du compte:", error);
        res.json({ success: false, error: "Erreur lors de la suppression du compte." });
    }
});

module.exports = router;
