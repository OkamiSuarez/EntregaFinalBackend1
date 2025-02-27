import { Router } from "express";
import UsuarioModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { createHash, isValidPassword } from "../utils/util.js";
import router from "./product.router.js";
import passport from "passport";

router.get('/current', passport.authenticate("current", { session: false }), (req, res) => {
    if (req.user) {
        res.render("profile", { usuario: req.user.usuario })
    } else {
        res.send("no estas autorizado amiguito")
    }
})

// verificamos que el user sea admin
router.get('/admin', passport.authenticate("current", { session: false }), (req, res) => {
    if (req.user.rol !== "admin") {
        return res.status(403).send("acceso denegado, moriras hackerrr")
    }
    res.render("admin")
})


// modificacion del cartID
import CartManager from "../managers/cart-manager.js"
const manager = new CartManager()

router.post("/register", async (req, res) => {
    try {
        const { usuario, password } = req.body;

        const nuevoCarrito = manager.crearCarrito()

        const user = new UsuarioModel({
            usuario,
            password: createHash(password),
            cart: nuevoCarrito._id
            // Pueden resolverlo de esta forma.
        });

        await user.save();

        res.redirect("/login");
    } catch (error) {
        console.error("Error al registrar usuario", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});


export default router