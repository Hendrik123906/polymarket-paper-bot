# Paper Quant Bot — BTC Up/Down 15m (Polymarket)

Paper-trading bot gaya Bonereaper: scalper market BTC naik/turun 15 menit di Polymarket.
**PAPER ONLY — uang virtual, tanpa modal beneran, tanpa order asli.**

- Modal virtual: $10 · Trade: $5 (minimum order Polymarket) · Maks 1 posisi
- Beli YES/NO cuma di harga 3–22 sen, kalau harga pasar ≥5 sen lebih murah dari fair-prob model (momentum + volatilitas, normal-CDF)
- Hold sampai expiry: bayar $1 kalau menang, $0 kalau kalah
- Bot jalan tiap 15 menit; dashboard ini update tiap siklus

Catatan jujur: backtest harga asli Polymarket belum bisa — market lama diarsipkan API publiknya. Validasi jalan lewat live paper trading + model test 48 jam (arah bener 71%, tapi itu BUKAN bukti profit karena harga pasar sudah mencerminkan arah).
