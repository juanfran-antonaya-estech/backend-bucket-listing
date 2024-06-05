import {Router} from "express";
import {pool} from "../db.js";

const router = Router()

router.get('/api/cathingory', async (req, res) => {
        const [result] = await pool.query("SELECT * FROM cathingory");
        res.json(result);
    }
)

router.get('/api/cathingory/:name', async(req,res) => {
    const [result] = await pool.query("SELECT * FROM cathingory WHERE name LIKE CONCAT('%', ?, '%')", [req.params.name])
    res.json(result)
})

export default router