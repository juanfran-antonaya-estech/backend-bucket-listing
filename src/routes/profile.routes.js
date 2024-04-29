import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get("/api/perfil/infoperfil/:id", async(req, res) => {
    const [results] = await pool.query("SELECT `us`.`usuario` AS `user`, `pf`.*\n" +
        "FROM `usuario` AS `us` \n" +
        "\tLEFT JOIN `profile` AS `pf` ON `pf`.`user_id` = `us`.`id`\n" +
        "WHERE `profile`.`id` = ?;", [req.params.id])
})

export default router