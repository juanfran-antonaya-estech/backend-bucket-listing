import Router from "express"
import { pool } from "../db.js";

const router = Router()

String.prototype.hashCode = function() {
    var hash = 0,
        i, chr;
    if (this.length === 0) return hash;
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}

router.post("/api/login", async(req,res) => {
    const main = {
        message: "",
        session_id: "",
        next_page: ""
    }
    const { usuario, password, device_ip } = req.body
    const concat = usuario + password + device_ip

    const [existence] = await pool.query("SELECT * FROM `pivot_login_user` WHERE `session_id` = ?",[concat.hashCode()])
    if (existence.length != 0) {
        main.message = "success"
        main.session_id = concat.hashCode()

        const [profcreated] = await pool.query("SELECT * FROM `profile` WHERE user_id = ?;", [existence[0].user_id])
        if (profcreated.length == 0) {
            main.next_page = "createprofile"
        } else {
            main.next_page = "feed"
        }
        res.status(200).json(main)
        return
    }

    const [result] = await pool.query("SELECT id, usuario AS user, pass FROM `usuario` WHERE usuario.usuario = ?;", usuario)
    if(result.length == 0){
        main.message = "wrong user/password"
        main.session_id = null
        main.next_page = "login"
        res.status(401).json(main)
        return
    }
    const usuarioResultado = result[0]
    const concat_resultado = usuarioResultado.user + usuarioResultado.pass + device_ip
    console.log(concat)
    console.log(concat_resultado)
    if (concat.hashCode() == concat_resultado.hashCode()){
        main.message = "success"
        main.session_id = concat_resultado.hashCode()
        const [profcreated] = await pool.query("SELECT * FROM `profile` WHERE user_id = ?;", usuarioResultado.id)
        if (profcreated.length == 0) {
        main.next_page = "createprofile"
        } else {
            main.next_page = "feed"
        }
        const {device_ip} = req.body
        const [creation] = await pool.query(`INSERT INTO pivot_login_user (id, user_id, device_ip, session_id) VALUES (NULL, '${usuarioResultado.id}','${device_ip}', '${concat_resultado.hashCode()}')`)
        console.log(creation)
        res.status(200).json(main)
    } else {
        main.message = "wrong user/password"
        main.session_id = null
        main.next_page = "login"
        res.status(401).json(main)
    }

})

router.post("/api/register", async (req,res) => {
    const [existing_users] = await pool.query("SELECT usuario FROM usuario")
    const {user, pass, email} = req.body

    let exist = false
    existing_users.forEach(euser => {
        if (euser.usuario === user){
            exist = true
        }
    })
    if (exist){
        res.status(404).send({"message": "usuario ya existe"})
    } else {
        const [creationresult] = await pool.query("INSERT INTO `usuario` (`id`, `usuario`, `pass`, `email`) VALUES (NULL, ?, ?, ?)", [user,pass,email])
        res.status(200).json({"message":"usuario creado"})
    }


})



export default router