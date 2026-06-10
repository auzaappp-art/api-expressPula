require('dotenv').config();
const express = require("express");
const app = express();
const port = 5775;
const cors = require("cors");
const db = require('./db.js');

app.set("view engine", "ejs");
app.set("views", "view");
app.use(express.static(__dirname + "/public"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Halaman utama
app.get("/", async (req, res) => {
    const dtx = await db.getbackup();
    res.render("beranda", { data: dtx });
});

// API JSON list backup
app.get("/api/backup", async (req, res) => {
    const dtx = await db.getbackup();
    res.json(dtx);
});

// API JSON detail transaksi per backup
app.get("/api/detail/:id", async (req, res) => {
    const detail = await db.getDetailBackup(req.params.id);
    res.json(detail);
});

// SSE - reactive real-time
app.get("/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const interval = setInterval(async () => {
        try {
            const data = await db.getbackup();
            res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch(err) {
            console.log("SSE error:", err.message);
        }
    }, 5000);

    req.on("close", () => clearInterval(interval));
});

// Status
app.get("/status", (req, res) => {
    res.json({ kode: "01", status: "API Berbasis ExpressJS OK" });
});

// POST backup dari Android/client
app.post("/backup", async (req, res) => {
    let pesanx, kodex;
    let nama  = req.body.nama_backup;
    let dtx   = Buffer.from(req.body.dtx, 'base64').toString('utf-8');
    let id    = Date.now();
    let proses = await db.tambahBackup(id, nama, "nodejs");

    if (proses == "1") {
        let berhasil = 0, gagal = 0;
        let arr_data = dtx.split("#");
        for (let k of arr_data) {
            let arr_data2 = k.split("|");
            let proses2 = await db.tambahTransaksi(
                `${id}-${arr_data2[0]}`, id,
                arr_data2[2], arr_data2[3], arr_data2[4], arr_data2[1]
            );
            proses2 == "1" ? berhasil++ : gagal++;
        }
        pesanx = { kode: "01", status: "Backup Berhasil", berhasil, gagal };
        kodex  = 200;
    } else {
        pesanx = { kode: "00", status: "Backup Gagal" };
        kodex  = 500;
    }
    return res.status(kodex).json(pesanx);
});

app.listen(port, () => console.log(`Server berjalan di Port: ${port}`));
