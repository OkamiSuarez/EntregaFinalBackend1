import { Router } from "express";
import UsuarioModel from "../models/user.model.js";
import jwt from "jsonwebtoken"
import { createHash, isValidPassword } from "../utils/util.js";
import router from "./product.router.js";
import passport from "passport";

// const router = Router()

// probablemente aqui tambien tenga que hacer modificaciones con la consigna
router.post("/login", async (req, res) => {
    try {
        const { usuario, password } = req.body;
        const user = await UsuarioModel.findOne({ usuario });

        if (!user) {
            return res.status(401).json({ error: "Usuario no encontrado" });
        }

        if (!isValidPassword(password, user)) {
            return res.status(401).json({ error: "Contraseña incorrecta" });
        }

        // genero el token
        const token = jwt.sign(
            { usuario: user.usuario, rol: user.rol },
            "coderhouse", {expiresIn: "1h"}
        );
        res.cookie("coderCookieToken", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/api/sessions/current")
    } catch (error) {
        console.error("Error al hacer login", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

// modificacion del cartID
import CartManager from "../managers/cart-manager.js"
const manager = new CartManager()

router.post("/register", async (req, res) => {
    try {
        const { usuario, password } = req.body;

        const nuevoCarrito = await manager.crearCarrito()

        const user = new UsuarioModel({
            usuario,
            password: createHash(password),
            cart: nuevoCarrito._id
            // o tambien
            // cart: crearCarrito()
        });
        // podemos resolverlo de esta forma.
        await user.save();

        res.redirect('/login')
    } catch (error) {
        console.error("Error al registrar usuario", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie("coderCookieToken");
    res.redirect("/login")
});

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
        return res.status(403).send("No lo intentes, no eres admin")
    }
    res.render("admin")
})





export default router