import passport from "passport";
import jwt from "passport-jwt";

const JWTStrategy = jwt.Strategy
const ExtractJwt = jwt.ExtractJwt

const initializePassport = () =>{
    passport.use("current", new JWTStrategy({
        // LA CONSIGNA PIDE QUE SE AGREGUE LA ESTRATEGIA CURRENT DE JWT 
            jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
            secretOrKey: "coderhouse"
    }, async(jwt_payload,done)=>{
        try {
            return done(null,jwt_payload)
        } catch (error) {
            return done(error)
        }
    }))

}

const cookieExtractor = () =>{
    let token = null
    if(req && req.cookies){
        token = req.cookies["coderCookieToken"]
    }
    return token;
}

export default initializePassport