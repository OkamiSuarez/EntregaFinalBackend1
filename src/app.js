// const express  = require('express')
import express from  "express"
const app = express();
const PUERTO = 8080;

import productRouter from "./routes/product.router.js"
import cartRouter from "./routes/cart.router.js"
import { engine } from "express-handlebars";
import { Server } from "socket.io";
import viewsRouter from "./routes/views.router.js"
import mongoose from "mongoose";
import cartModel from "./models/cart.model.js";
import productModel from "./models/products.model.js";
import sessionRouter from "./routes/sessions.router.js"
import passport, { initialize } from "passport";
import cookieParser from "cookie-parser";

const main = async () =>{
    mongoose.connect("mongodb+srv://okami97backdev:coderhouse@cluster0.tfr60.mongodb.net/EntregaFinal?retryWrites=true&w=majority&appName=Cluster0")
}

main()

// middleware
app.use(express.json())
// se declara al server que se va a trabajar con JSON
app.use(express.urlencoded({extended: true}))
app.use(express.static("./src/public"))
app.use(cookieParser())
app.use(passport.initialize())
initializePassport()

// ruta base
app.get('/',(req,res)=>{
    res.send("Entrega final coderhouse Okami Suarez")
})

// Express handlebars
app.engine("handlebars", engine())
app.set("view engine","handlebars")
app.set("views","./src/views")

// RUTAS
app.use("/api/products", productRouter)
app.use("/api/carts", cartRouter)
app.use("/api/sessions", sessionRouter)
app.use("/",viewsRouter)

//  Listen
const httpServer = app.listen(PUERTO,()=>{
    console.log("escuchando el puerto 8080")
})

// websockets

import ProductManager from "./managers/product-manager.js";
import initializePassport from "./config/passport.config.js";
const manager = new ProductManager("./src/data/productos.json")


const io =  new Server(httpServer)
io.on("connection",async(socket)=>{
    console.log("cliente conectado")

    // se envia  el array de productos
    socket.emit("productos", await manager.getProducts())

    // agregando productos
    socket.on("agregarProducto", async(producto)=>{
        await manager.addProduct(producto)
        io.sockets.emit("productos", await manager.getProducts())
    })

    // eliminando producto 
    socket.on("eliminarProducto", async (id)=>{
            await manager.deleteProduct(id)
            io.sockets.emit("productos", await manager.getProducts())
    })
})