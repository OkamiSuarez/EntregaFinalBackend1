import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    // ESTO SE MODIFICA CON RELACION A LO QUE PIDE LA CONSIGNA 
    usuario: String,
    password: String,
    cart: String,
    rol:{
        type:String,
        enum: ["admin","user"],
        default:"user"
    }
})

const UsuarioModel = mongoose.model("usuarios",usuarioSchema)

export default UsuarioModel

// Falta
/*  first_name:String,
last_name:String,
email:String (único)
age:Number,
password:String(Hash)
cart:Id con referencia a Carts
role:String(default:’user’)
*/