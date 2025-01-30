import { Router } from "express";
const router = Router()
import CartManager from "../managers/cart-manager.js"
// const manager = new CartManager("./src/data/cart.json")
// IMPORTACION DEL MODEL PARA LA DB
import cartModel from "../models/cart.model.js";
import productModel from "../models/products.model.js";
import { get } from "http";
// NUEVA INFORMACION CON MONGODB PARA LA ENTREGA
// ruta get
router.get("/", async (req, res) => {
    try {
        const getCart = await cartModel.find()
        res.send(getCart)
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener el cart' })
    }
})

// ruta de carrito para  id
router.get("/:cid", async (req, res) => {
    try {
        const getCart = await cartModel.findById(req.params.cid).populate('products.product').lean()
        res.send(getCart)
    } catch (error) {
        res.status(500).send("no se pudo actualizar")
    }
})

// ruta para post
router.post("/", async (req, res) => {
    try {
        const addCart = new cartModel(req.body)
        await addCart.save()
        res.send({ mensaje: 'Carrito creado exitosamente', addCart })
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al agregar un producto al carrito' })
    }
})

// ruta para agregar producto seleccionado
router.post("/:cid/product/:pid", async (req, res) => {
    // CREAR CARRITO CON POPULATE 
    try {
        const getCart = await cartModel.findById(req.params.cid)
        const getProduct = await productModel.findById(req.params.pid)
        getCart.products.push({
            product: getProduct,
            quantity: 1
        })
        await getCart.save()
        res.send({ mensaje: "producto agregado", getCart })
    } catch (error) {
        console.log(error)
    }
})

// ruta put para actualizar por ID
router.put("/:cid", async (req, res) => {

    try {
        const { cid } = req.params;
        const { products } = req.body;

        // Validar que products sea un arreglo
        if (!Array.isArray(products)) {
            return res.status(400).send("El campo 'products' debe ser un arreglo");
        }

        // Validar la estructura de cada producto en el arreglo
        const validProducts = products.every(item => 
            mongoose.Types.ObjectId.isValid(item.product) && 
            Number.isInteger(item.quantity) && 
            item.quantity >= 0
        );

        if (!validProducts) {
            return res.status(400).send("Estructura de productos inválida");
        }

        // Actualizar el carrito
        const updatedCart = await cartModel.findByIdAndUpdate(
            cid,
            { $set: { products: products } },
            { new: true, runValidators: true }
        );

        if (!updatedCart) {
            return res.status(404).send("Carrito no encontrado");
        }

        res.status(200).json({
            status: "success",
            message: "Carrito actualizado exitosamente",
            cart: updatedCart
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("No se pudo actualizar el carrito: " + error.message);
    }

    try {
        const putCart = await cartModel.findByIdAndUpdate(req.params.cid, req.body)
        res.send("Producto actualizado")
    } catch (error) {
        res.status(500).send("no se pudo actualizar")
    }
})

// ruta para eliminar por id
router.delete("/:cid", async (req, res) => {
    try {
        const delCart = await cartModel.findByIdAndDelete(req.params.cid)
        if (!delCart) {
            return res.json({
                error: "Producto no encontrado por ID"
            });
        }
        res.send('Producto eliminado')
    } catch (error) {
        res.status(500).send("no se pudo eliminar el carrito")
    }
})

// ruta 2 para eliminar por id de carrito y producto 
router.delete("/:cid/products/:pid", async (req, res) => {
    // Eliminar el carrito del producto seleccionado
    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const updatedCart = await cartModel.findByIdAndUpdate(
            cartId,
            { $pull: { products: { "_id": productId } } },
            { new: true }
        ).populate('products.product');
        if (!updatedCart) {
            return res.status(404).json({ mensaje: "Carrito no encontrado" });
        }
        res.send({ mensaje: "producto eliminado", updatedCart })
    } catch (error) {
        console.log(error)
    }
})

// ruta put para actualizar por ID
router.put("/:cid/products/:pid", async (req, res) => {
    // SOLO LA QTY LA EDITA
    // RECIBIR Y MODIFICAR NADA MAS ESO 

    try {
        const cartId = req.params.cid;
        const productId = req.params.pid;
        const { quantity } = req.body
        if (!quantity || quantity < 0) {
            return res.status(400).json({ mensaje: "Cantidad inválida" });
        }
        const updatedCart = await cartModel.findOneAndUpdate(
            {
                _id: cartId,
                "products._id": productId
            },
            {
                $set: {"products.$.quantity": quantity} 
            },
            {
                new: true
            }
        ).populate('products.product');;
        res.send({ mensaje: "producto actualizado", updatedCart })
    } catch (error) {
        console.log(error)
    }
})

export default router