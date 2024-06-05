import {pool} from "../db.js";
import Router from "express";

const router = Router()

router.get("/api/thingos/:page/:id", async (req, res) => {
        const main = {};

        // Obtener el número de página
        const pagina = parseInt(req.params.page);

        // Obtener el total de registros
        const [info] = await pool.query(`SELECT COUNT(*) as total FROM pivot_thingos_perfil AS pv 
            JOIN thingos AS th ON pv.thingo_id = th.id
            JOIN cathingory AS cat ON th.cathingory_id = cat.id
            JOIN profile AS other ON pv.profile_id = other.id
                                         WHERE pv.thingo_id = ?
;`, [req.params.id]);

        const totalItems = info[0].total;
        const itemsPorPagina = 10;
        const offset = (pagina - 1) * itemsPorPagina;

        // Obtener los registros
        const [results] = await pool.query(`
            SELECT pv.thingo_id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria_thingo, other.apodo AS hecho
            FROM pivot_thingos_perfil as pv 
            JOIN thingos AS th ON pv.thingo_id = th.id
            JOIN cathingory AS cat ON th.cathingory_id = cat.id
            JOIN profile AS other ON pv.profile_id = other.id
            WHERE pv.thingo_id = ?
            LIMIT ? OFFSET ?
        `, [req.params.id,itemsPorPagina, offset]);

        // Calculo del número total de páginas
        let pageCount;
        if (totalItems === 0) {
            pageCount = 1;
        } else {
            const pages = totalItems / itemsPorPagina;
            if (pages % 1 === 0) {
                pageCount = pages;
            } else {
                pageCount = (pages - (pages % 1)) + 1; // Redondeo
            }
        }

        const siguentePagina = pagina < pageCount ? pagina + 1 : null;
        const prevPage = pagina > 1 ? pagina - 1 : null;

        main.info = {
            count: totalItems,
            pages: pageCount,
            next: siguentePagina,
            prev: prevPage
        };

        main.results = results;

        res.json(main);
});

router.get("/api/thingos/:name", async (req, res) => {

    const nombre = req.params.name

    const [results] = await pool.query("SELECT th.id, th.name AS nombre_thingo, cat.name AS nombre_categoria, cat.image AS imagen_categoria FROM thingos AS th\n" +
        "JOIN cathingory AS cat ON th.cathingory_id = cat.id\n" +
        `WHERE LOWER(th.name) LIKE CONCAT('%', '${nombre}', '%');`)
    console.log(nombre)

    res.json(results)

})

export default router