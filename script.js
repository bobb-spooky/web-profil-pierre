/* =====================================================================
   script.js — Web Profil Pierre Tristan LamaRio

   Mengikuti pola modul: setiap fitur ditulis sebagai fungsi initXxx()
   tersendiri, lalu seluruhnya dipanggil di bagian paling bawah berkas.
   Setiap fungsi memeriksa keberadaan elemen terlebih dahulu agar tidak
   menghentikan fitur lain apabila salah satu elemen tidak ditemukan.
   ===================================================================== */


/* =====================================================================
   FITUR 1 — MODE GELAP

   Proses:
   1. classList.toggle("mode-gelap") menambah/menghapus class pada <body>;
      nilai kembaliannya (true/false) dipakai operator ternary untuk
      menentukan ikon yang ditampilkan.
   2. Pilihan tema disimpan pada localStorage agar tetap sama ketika
      halaman dibuka kembali. Dibungkus try/catch karena localStorage
      dapat ditolak peramban pada kondisi tertentu.
   ===================================================================== */

function initDarkMode() {

    const tombolTema = document.getElementById("dark-mode-toggle");

    if (!tombolTema) {
        return;
    }

    /* Menerapkan kembali tema yang tersimpan sebelumnya */
    try {
        if (localStorage.getItem("tema") === "gelap") {
            document.body.classList.add("mode-gelap");
            tombolTema.textContent = "☀";
        }
    } catch (error) {
        /* Diabaikan: tema cukup kembali ke mode terang */
    }

    tombolTema.addEventListener("click", function () {

        const modeGelapAktif =
            document.body.classList.toggle("mode-gelap");

        tombolTema.textContent = modeGelapAktif ? "☀" : "☾";

        try {
            localStorage.setItem(
                "tema",
                modeGelapAktif ? "gelap" : "terang"
            );
        } catch (error) {
            /* Diabaikan */
        }

    });
}


/* =====================================================================
   FITUR 2 — MENU HAMBURGER (NAVIGASI MOBILE)

   Proses:
   1. Klik hamburger menambah/melepas class "hamburger-aktif" (tiga garis
      menjadi ikon silang) dan "menu-terbuka" (menu digeser terlihat).
   2. Menu ditutup kembali saat salah satu tautan diklik, agar tidak
      terus menutupi layar setelah berpindah section.
   3. Tombol Escape juga menutup menu.
   ===================================================================== */

function initHamburgerMenu() {

    const hamburger = document.getElementById("hamburger");
    const navMenu = document.getElementById("nav-menu");
    const semuaTautanNav = document.querySelectorAll(".nav-link");

    if (!hamburger || !navMenu) {
        return;
    }

    function tutupMenu() {
        navMenu.classList.remove("menu-terbuka");
        hamburger.classList.remove("hamburger-aktif");
        hamburger.setAttribute("aria-expanded", "false");
    }

    hamburger.addEventListener("click", function () {

        hamburger.classList.toggle("hamburger-aktif");

        const menuTerbuka =
            navMenu.classList.toggle("menu-terbuka");

        hamburger.setAttribute("aria-expanded", menuTerbuka);

    });

    /* .forEach() menjalankan kode yang sama pada setiap tautan —
       fungsinya setara perulangan for, hanya lebih ringkas. */
    semuaTautanNav.forEach(function (tautan) {
        tautan.addEventListener("click", tutupMenu);
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            tutupMenu();
        }
    });
}


/* =====================================================================
   FITUR 3 — EFEK NAVBAR SAAT DIGULIR + INDIKATOR KEMAJUAN BACA

   Proses setiap kali halaman digulir:
   1. window.scrollY > 40  →  navbar diberi bayangan.
   2. getBoundingClientRect() memeriksa posisi setiap section terhadap
      jendela peramban untuk menentukan section yang sedang dilihat.
   3. Tautan navigasi yang href-nya cocok diberi class "link-aktif";
      class lama dihapus lebih dahulu agar tidak menumpuk.
   4. Lebar progress bar dihitung dari perbandingan posisi gulir
      terhadap total tinggi halaman yang dapat digulir.
   ===================================================================== */

function initNavbarScrollEffects() {

    const navbar = document.getElementById("navbar");
    const barKemajuan = document.getElementById("reading-progress-bar");

    const semuaSection = document.querySelectorAll(".section, .hero");
    const semuaTautanNav = document.querySelectorAll(".nav-link");

    window.addEventListener("scroll", function () {

        /* Langkah 1 — bayangan navbar */
        if (navbar) {
            if (window.scrollY > 40) {
                navbar.classList.add("navbar-scrolled");
            } else {
                navbar.classList.remove("navbar-scrolled");
            }
        }

        /* Langkah 2 — mencari section yang sedang terlihat.
           Angka 120 kira-kira setinggi navbar. */
        let idSectionAktif = "";

        semuaSection.forEach(function (section) {

            const posisi = section.getBoundingClientRect();

            if (posisi.top <= 120 && posisi.bottom > 120) {
                idSectionAktif = section.getAttribute("id");
            }

        });

        /* Langkah 3 — menandai tautan navigasi yang sesuai */
        semuaTautanNav.forEach(function (tautan) {

            tautan.classList.remove("link-aktif");

            if (tautan.getAttribute("href") === "#" + idSectionAktif) {
                tautan.classList.add("link-aktif");
            }

        });

        /* Langkah 4 — indikator kemajuan baca (FITUR TAMBAHAN).
           scrollHeight = tinggi seluruh halaman,
           innerHeight  = tinggi layar yang terlihat,
           selisihnya adalah jarak maksimal yang dapat digulir. */
        if (barKemajuan) {

            const jarakMaksimal =
                document.documentElement.scrollHeight - window.innerHeight;

            const persen =
                jarakMaksimal > 0
                    ? (window.scrollY / jarakMaksimal) * 100
                    : 0;

            barKemajuan.style.width = persen + "%";

        }

    });
}


/* =====================================================================
   FITUR 4 — ANIMASI PENGHITUNG STATISTIK (COUNTER)

   a) jalankanAnimasiCounter() menaikkan angka dari 0 menuju data-target.
   b) initCounterAnimation() memantau kapan section Tentang terlihat,
      lalu memanggil (a) tepat satu kali.
   ===================================================================== */

function jalankanAnimasiCounter() {

    const semuaCounter = document.querySelectorAll(".counter");

    semuaCounter.forEach(function (counter) {

        /* data-target dibaca sebagai TEKS, sehingga perlu diubah
           menjadi angka menggunakan parseInt(..., 10). */
        const nilaiTarget = parseInt(counter.dataset.target, 10);

        /* Perlindungan apabila data-target kosong atau bukan angka */
        if (isNaN(nilaiTarget)) {
            return;
        }

        let nilaiSaatIni = 0;

        /* Dibulatkan ke atas agar animasi tetap berjalan meskipun
           hasil pembagiannya berupa pecahan (target kecil = 1). */
        const kenaikanPerLangkah = Math.ceil(nilaiTarget / 50);

        /* setInterval menjalankan fungsi berulang setiap 30 milidetik */
        const interval = setInterval(function () {

            nilaiSaatIni += kenaikanPerLangkah;

            if (nilaiSaatIni >= nilaiTarget) {

                nilaiSaatIni = nilaiTarget;

                /* clearInterval WAJIB dipanggil; tanpa baris ini fungsi
                   akan terus terpanggil selamanya (seperti infinite loop). */
                clearInterval(interval);

            }

            counter.textContent = nilaiSaatIni;

        }, 30);

    });
}


function initCounterAnimation() {

    const sectionTentang = document.getElementById("tentang");

    if (!sectionTentang) {
        return;
    }

    /* Penanda agar animasi hanya dijalankan satu kali */
    let animasiSudahDijalankan = false;

    function periksaPosisi() {

        if (animasiSudahDijalankan) {
            return;
        }

        const posisi = sectionTentang.getBoundingClientRect();

        if (posisi.top < window.innerHeight - 100) {
            jalankanAnimasiCounter();
            animasiSudahDijalankan = true;
        }

    }

    window.addEventListener("scroll", periksaPosisi);

    /* Diperiksa sekali saat halaman dimuat, untuk layar besar yang
       sudah menampilkan section Tentang tanpa perlu digulir. */
    periksaPosisi();
}


/* =====================================================================
   FITUR 5 — FILTER PORTOFOLIO

   Setiap item memiliki data-kategori, setiap tombol filter memiliki
   atribut yang sama. JavaScript mencocokkan keduanya.
   classList.toggle("nama", kondisi) dengan argumen kedua memaksa class
   ada (true) atau tidak ada (false).
   ===================================================================== */

function initPortfolioFilter() {

    const semuaTombolFilter = document.querySelectorAll(".filter-btn");
    const semuaItemPortofolio = document.querySelectorAll(".portfolio-item");
    const pesanKosong = document.getElementById("portfolio-kosong");

    if (semuaTombolFilter.length === 0 || semuaItemPortofolio.length === 0) {
        return;
    }

    semuaTombolFilter.forEach(function (tombol) {

        tombol.addEventListener("click", function () {

            const kategoriDipilih = tombol.dataset.kategori;

            let jumlahTampil = 0;

            semuaItemPortofolio.forEach(function (item) {

                const cocok =
                    kategoriDipilih === "semua" ||
                    item.dataset.kategori === kategoriDipilih;

                item.classList.toggle("tersembunyi", !cocok);

                if (cocok) {
                    jumlahTampil = jumlahTampil + 1;
                }

            });

            /* Menandai tombol yang sedang aktif: lepas semua, tambah satu */
            semuaTombolFilter.forEach(function (t) {
                t.classList.remove("aktif");
            });

            tombol.classList.add("aktif");

            /* Pesan apabila tidak ada item pada kategori tersebut */
            if (pesanKosong) {
                pesanKosong.textContent =
                    jumlahTampil === 0
                        ? "Belum ada karya pada kategori ini."
                        : "";
            }

        });

    });
}


/* =====================================================================
   FITUR 6 — SLIDER TESTIMONI

   Tahap 1: titik navigasi dibuat otomatis sebanyak jumlah slide
            menggunakan createElement() lalu appendChild().
   Tahap 2: tampilkanSlide(index) melepas class aktif dari seluruh
            slide/titik, lalu menambahkannya pada satu nomor saja.
   Tahap 3: tombol maju, mundur, dan putaran otomatis memanggil fungsi
            yang sama; operator modulus (%) membuat urutan berputar
            kembali ke slide pertama setelah slide terakhir.
   ===================================================================== */

function initTestimonialSlider() {

    const semuaSlide = document.querySelectorAll(".testimonial-slide");
    const kontainerTitik = document.getElementById("testi-dots");
    const tombolNext = document.getElementById("testi-next");
    const tombolPrev = document.getElementById("testi-prev");
    const trek = document.getElementById("testimonial-track");

    if (semuaSlide.length === 0 || !kontainerTitik || !tombolNext || !tombolPrev) {
        return;
    }

    let indexAktif = 0;
    let putaranOtomatis = null;

    /* Tahap 1 — membuat titik navigasi */
    semuaSlide.forEach(function (_, index) {

        const titik = document.createElement("button");

        titik.classList.add("testi-dot");
        titik.setAttribute("type", "button");
        titik.setAttribute(
            "aria-label",
            "Tampilkan testimoni ke-" + (index + 1)
        );

        if (index === 0) {
            titik.classList.add("dot-aktif");
        }

        titik.addEventListener("click", function () {
            tampilkanSlide(index);
            mulaiPutaranOtomatis();   /* hitungan ulang setelah klik manual */
        });

        kontainerTitik.appendChild(titik);

    });

    const semuaTitik = kontainerTitik.querySelectorAll(".testi-dot");

    /* Tahap 2 — pola "lepas semua, lalu tambahkan satu" */
    function tampilkanSlide(index) {

        semuaSlide.forEach(function (slide) {
            slide.classList.remove("slide-aktif");
        });

        semuaTitik.forEach(function (titik) {
            titik.classList.remove("dot-aktif");
        });

        semuaSlide[index].classList.add("slide-aktif");
        semuaTitik[index].classList.add("dot-aktif");

        indexAktif = index;
    }

    function slideBerikutnya() {
        tampilkanSlide((indexAktif + 1) % semuaSlide.length);
    }

    function slideSebelumnya() {
        /* Ditambah semuaSlide.length agar hasilnya tidak negatif
           ketika mundur dari slide pertama. */
        tampilkanSlide(
            (indexAktif - 1 + semuaSlide.length) % semuaSlide.length
        );
    }

    /* Tahap 3 — navigasi manual dan otomatis */
    tombolNext.addEventListener("click", function () {
        slideBerikutnya();
        mulaiPutaranOtomatis();
    });

    tombolPrev.addEventListener("click", function () {
        slideSebelumnya();
        mulaiPutaranOtomatis();
    });

    function mulaiPutaranOtomatis() {
        clearInterval(putaranOtomatis);
        putaranOtomatis = setInterval(slideBerikutnya, 6000);
    }

    /* Putaran dihentikan sementara saat kursor berada di atas slider,
       agar pengunjung tidak kehilangan testimoni yang sedang dibaca. */
    if (trek) {

        trek.addEventListener("mouseenter", function () {
            clearInterval(putaranOtomatis);
        });

        trek.addEventListener("mouseleave", mulaiPutaranOtomatis);

    }

    tampilkanSlide(0);
    mulaiPutaranOtomatis();
}


/* =====================================================================
   FITUR 7 — ACCORDION FAQ

   Proses:
   1. Kondisi item yang diklik diperiksa lebih dahulu dengan
      classList.contains(), lalu SELURUH item ditutup.
   2. Apabila item tadi sebelumnya tertutup, item dibuka kembali —
      sehingga klik kedua pada pertanyaan yang sama menutupnya.
   3. scrollHeight dipakai karena CSS tidak dapat menganimasikan
      max-height menuju nilai auto; nilai piksel pasti harus diberikan.
   ===================================================================== */

function initAccordionFAQ() {

    const semuaItemFAQ = document.querySelectorAll(".accordion-item");

    if (semuaItemFAQ.length === 0) {
        return;
    }

    function tutupSemua() {

        semuaItemFAQ.forEach(function (item) {

            item.classList.remove("item-terbuka");

            const jawaban = item.querySelector(".accordion-answer");
            const tombol = item.querySelector(".accordion-question");

            if (jawaban) {
                jawaban.style.maxHeight = null;
            }

            if (tombol) {
                tombol.setAttribute("aria-expanded", "false");
            }

        });

    }

    semuaItemFAQ.forEach(function (item) {

        const tombolPertanyaan = item.querySelector(".accordion-question");
        const elemenJawaban = item.querySelector(".accordion-answer");

        if (!tombolPertanyaan || !elemenJawaban) {
            return;
        }

        tombolPertanyaan.addEventListener("click", function () {

            const sedangTerbuka = item.classList.contains("item-terbuka");

            tutupSemua();

            if (!sedangTerbuka) {

                item.classList.add("item-terbuka");
                tombolPertanyaan.setAttribute("aria-expanded", "true");

                elemenJawaban.style.maxHeight =
                    elemenJawaban.scrollHeight + "px";

            }

        });

    });

    /* Saat lebar jendela berubah, tinggi teks jawaban ikut berubah,
       sehingga nilai max-height perlu dihitung ulang. */
    window.addEventListener("resize", function () {

        const itemTerbuka = document.querySelector(
            ".accordion-item.item-terbuka .accordion-answer"
        );

        if (itemTerbuka) {
            itemTerbuka.style.maxHeight = itemTerbuka.scrollHeight + "px";
        }

    });
}


/* =====================================================================
   FITUR 8 — VALIDASI FORM KONTAK

   event.preventDefault() mencegah halaman memuat ulang, setiap kolom
   diperiksa dengan if, dan hasilnya ditampilkan melalui fungsi bantu
   tampilkanStatus() yang menerima dua parameter (pesan dan jenis).
   Data tidak dikirim ke server — pengiriman hanya disimulasikan.
   ===================================================================== */

function initContactForm() {

    const form = document.getElementById("contact-form");
    const elemenStatus = document.getElementById("form-status");

    if (!form || !elemenStatus) {
        return;
    }

    function tampilkanStatus(pesan, jenis) {
        elemenStatus.textContent = pesan;
        elemenStatus.classList.remove("sukses", "gagal");
        elemenStatus.classList.add("tampil", jenis);
    }

    form.addEventListener("submit", function (event) {

        event.preventDefault();

        const nilaiNama = document.getElementById("cf-nama").value.trim();
        const nilaiEmail = document.getElementById("cf-email").value.trim();
        const nilaiSubjek = document.getElementById("cf-subjek").value.trim();
        const nilaiPesan = document.getElementById("cf-pesan").value.trim();

        if (
            nilaiNama === "" ||
            nilaiEmail === "" ||
            nilaiSubjek === "" ||
            nilaiPesan === ""
        ) {
            tampilkanStatus(
                "Seluruh kolom wajib diisi sebelum pesan dapat dikirim.",
                "gagal"
            );
            return;
        }

        if (nilaiNama.length < 3) {
            tampilkanStatus(
                "Nama terlalu singkat. Mohon isi minimal 3 karakter.",
                "gagal"
            );
            return;
        }

        /* Pemeriksaan sederhana format email: harus memuat "@" dan titik
           setelahnya, serta tidak diawali/diakhiri tanda tersebut. */
        if (nilaiEmail.indexOf("@") < 1 || nilaiEmail.lastIndexOf(".") < nilaiEmail.indexOf("@")) {
            tampilkanStatus(
                "Format email belum benar. Contoh: nama@email.com",
                "gagal"
            );
            return;
        }

        if (nilaiPesan.length < 10) {
            tampilkanStatus(
                "Pesan terlalu singkat. Mohon tulis minimal 10 karakter.",
                "gagal"
            );
            return;
        }

        tampilkanStatus(
            `Terima kasih, ${nilaiNama}! Pesan Anda telah saya terima.`,
            "sukses"
        );

        form.reset();

        /* Penghitung karakter dikembalikan ke keadaan awal */
        const penghitung = document.getElementById("char-counter");

        if (penghitung) {
            penghitung.textContent = "0 / 300 karakter";
            penghitung.classList.remove("hampir-penuh");
        }

    });
}


/* =====================================================================
   FITUR 9 — TOMBOL KEMBALI KE ATAS
   ===================================================================== */

function initBackToTopButton() {

    const tombolKeAtas = document.getElementById("back-to-top");

    if (!tombolKeAtas) {
        return;
    }

    window.addEventListener("scroll", function () {

        if (window.scrollY > 500) {
            tombolKeAtas.classList.add("tombol-tampil");
        } else {
            tombolKeAtas.classList.remove("tombol-tampil");
        }

    });

    tombolKeAtas.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
}


/* =====================================================================
   FITUR TAMBAHAN A — SALIN EMAIL

   Proses:
   1. Alamat email dibaca dari elemen #email-value melalui textContent.
   2. navigator.clipboard.writeText() menyalinnya ke papan klip. Perintah
      ini bersifat asinkron, sehingga hasilnya ditangani dengan .then()
      (berhasil) dan .catch() (gagal, misalnya dibuka tanpa izin).
   3. Pesan status ditampilkan, lalu dihapus otomatis setelah 3 detik
      menggunakan setTimeout().
   ===================================================================== */

function initCopyEmail() {

    const tombolSalin = document.getElementById("copy-email");
    const elemenEmail = document.getElementById("email-value");
    const elemenStatus = document.getElementById("copy-status");

    if (!tombolSalin || !elemenEmail || !elemenStatus) {
        return;
    }

    function tampilkanPesan(pesan) {

        elemenStatus.textContent = pesan;

        setTimeout(function () {
            elemenStatus.textContent = "";
        }, 3000);

    }

    tombolSalin.addEventListener("click", function () {

        const alamatEmail = elemenEmail.textContent.trim();

        if (navigator.clipboard) {

            navigator.clipboard.writeText(alamatEmail)
                .then(function () {
                    tampilkanPesan("Email berhasil disalin.");
                })
                .catch(function () {
                    tampilkanPesan("Email belum dapat disalin. Silakan salin manual.");
                });

        } else {

            tampilkanPesan("Peramban tidak mendukung penyalinan otomatis.");

        }

    });
}


/* =====================================================================
   FITUR TAMBAHAN B — PENGHITUNG KARAKTER PADA KOLOM PESAN

   Proses:
   1. Event "input" berjalan setiap kali isi textarea berubah — berbeda
      dengan "change" yang baru berjalan setelah kolom ditinggalkan.
   2. Panjang teks dibaca melalui .value.length, lalu ditampilkan
      bersama batas maksimal yang diambil dari atribut maxlength.
   3. Saat tersisa kurang dari 30 karakter, class "hampir-penuh"
      ditambahkan agar tulisan berubah warna sebagai peringatan.
   ===================================================================== */

function initCharCounter() {

    const kolomPesan = document.getElementById("cf-pesan");
    const penghitung = document.getElementById("char-counter");

    if (!kolomPesan || !penghitung) {
        return;
    }

    const batasMaksimal =
        parseInt(kolomPesan.getAttribute("maxlength"), 10) || 300;

    kolomPesan.addEventListener("input", function () {

        const jumlahKarakter = kolomPesan.value.length;

        penghitung.textContent =
            jumlahKarakter + " / " + batasMaksimal + " karakter";

        penghitung.classList.toggle(
            "hampir-penuh",
            batasMaksimal - jumlahKarakter < 30
        );

    });
}


/* =====================================================================
   MENJALANKAN SELURUH FITUR

   Karena <script src="script.js"> diletakkan tepat sebelum </body>,
   seluruh elemen HTML sudah selesai dibaca peramban saat baris-baris
   berikut dijalankan, sehingga getElementById/querySelector di dalam
   setiap fungsi dapat langsung menemukan elemen yang dicarinya.
   ===================================================================== */

initDarkMode();
initHamburgerMenu();
initNavbarScrollEffects();
initCounterAnimation();
initPortfolioFilter();
initTestimonialSlider();
initAccordionFAQ();
initContactForm();
initBackToTopButton();
initCopyEmail();
initCharCounter();