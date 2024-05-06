import {pool} from "../db.js";
import Router from "express";

const router = Router()

router.get("/api/feed/thingosusuario/:page/:id", async (req, res) => {
    const main = {};
    const [info] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS nombre_de_quien_lo_ha_hecho\n" +
        "FROM pivot_thingos_perfil AS pv\n" +
        "JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "JOIN profile AS other ON pv.profile_id = other.id;");


    let lista = [1, 2, 3, 4];
    let conteo = lista.length;

    const pagina = parseInt(req.params.page);

    const [results] = await pool.query("SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS hecho FROM pivot_thingos_perfil as pv \n" +
        "        JOIN thingos AS th ON pv.thingo_id = th.id\n" +
        "        JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        "        JOIN profile AS other ON pv.profile_id = other.id\n" +
        "        JOIN pivot_thingos_perfil AS pivo ON pv.profile_id = pivo.id\n" +
        `        WHERE 1 LIMIT 10 OFFSET ${(pagina - 1) * 10}`);
    res.json({
        info,
        results
    });
    return

    main.info = {
        count: info.length,
        pages: info.length / 10,
        next: "",
        prev: null
    };

    main.results = results;
});

export default router