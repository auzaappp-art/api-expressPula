const mysql = require('mysql2/promise');

const buatKoneksi = async () => {
    return await mysql.createConnection({
        host: '194.233.65.45',
        user: 'u20xkry9_zavira',
        password: 'ZaViRaAuLiA1234',
        database: 'u20xkry9_transaksi'
    });
};

const tambahBackup = async (id, nama, channel) => {
    const db = await buatKoneksi();
    const sql = `INSERT INTO backup VALUES('${id}','${nama}','${channel}',NOW())`;
    try {
        await db.execute(sql);
        await db.end();
        return "1";
    } catch(err) {
        console.log("Error tambahBackup:", err.message);
        return "0";
    }
};

const tambahTransaksi = async (idx, id, waktux, nominalx, jenisx, deskripsix) => {
    const db = await buatKoneksi();
    const sql = `INSERT INTO backup_transaksi VALUES('${idx}','${id}','${waktux}','${nominalx}','${jenisx}','${deskripsix}')`;
    try {
        await db.execute(sql);
        await db.end();
        return "1";
    } catch(err) {
        console.log("Error tambahTransaksi:", err.message);
        return "0";
    }
};

// Ambil semua backup - kolom asli: id, nama, channel, waktu
const getbackup = async () => {
    const db = await buatKoneksi();
    const [rows] = await db.execute("SELECT * FROM backup ORDER BY waktu DESC");
    await db.end();
    return rows.length > 0 ? rows : [];
};

// Ambil detail transaksi berdasarkan id_backup
const getDetailBackup = async (id_backup) => {
    const db = await buatKoneksi();
    const [rows] = await db.execute(
        `SELECT * FROM backup_transaksi WHERE id_backup = '${id_backup}' ORDER BY tgl_jam ASC`
    );
    await db.end();
    return rows;
};

module.exports = { buatKoneksi, tambahBackup, tambahTransaksi, getbackup, getDetailBackup };
