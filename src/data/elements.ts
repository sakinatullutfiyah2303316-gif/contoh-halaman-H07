export interface ElementData {
  z: number;
  symbol: string;
  name: string;
  mass: string;
  category: number; // 0 to 8
  group: number | null; // 1-18 or null for lanthanides/actinides
  groupName: string; // IA, IIA, VIIA, dll.
  period: number; // 1-7
  shells: number[]; // K, L, M, N, O, P, Q
  valenceElectrons: number;
  isGroupA: boolean;
  uses: string;
}

export interface CategoryInfo {
  id: number;
  name: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  bgDark: string;
  borderDark: string;
  textDark: string;
}

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 0,
    name: 'Logam alkali',
    bgLight: '#FCEBEB',
    borderLight: '#A32D2D',
    textLight: '#791F1F',
    bgDark: '#791F1F',
    borderDark: '#F09595',
    textDark: '#F7C1C1'
  },
  {
    id: 1,
    name: 'Logam alkali tanah',
    bgLight: '#FAEEDA',
    borderLight: '#854F0B',
    textLight: '#633806',
    bgDark: '#633806',
    borderDark: '#EF9F27',
    textDark: '#FAC775'
  },
  {
    id: 2,
    name: 'Logam transisi',
    bgLight: '#E6F1FB',
    borderLight: '#185FA5',
    textLight: '#0C447C',
    bgDark: '#0C447C',
    borderDark: '#85B7EB',
    textDark: '#B5D4F4'
  },
  {
    id: 3,
    name: 'Logam lain',
    bgLight: '#F1EFE8',
    borderLight: '#5F5E5A',
    textLight: '#444441',
    bgDark: '#444441',
    borderDark: '#B4B2A9',
    textDark: '#D3D1C7'
  },
  {
    id: 4,
    name: 'Metaloid',
    bgLight: '#E1F5EE',
    borderLight: '#0F6E56',
    textLight: '#085041',
    bgDark: '#085041',
    borderDark: '#5DCAA5',
    textDark: '#9FE1CB'
  },
  {
    id: 5,
    name: 'Nonlogam',
    bgLight: '#EAF3DE',
    borderLight: '#3B6D11',
    textLight: '#27500A',
    bgDark: '#27500A',
    borderDark: '#97C459',
    textDark: '#C0DD97'
  },
  {
    id: 6,
    name: 'Halogen',
    bgLight: '#FBEAF0',
    borderLight: '#993556',
    textLight: '#72243E',
    bgDark: '#72243E',
    borderDark: '#ED93B1',
    textDark: '#F4C0D1'
  },
  {
    id: 7,
    name: 'Gas mulia',
    bgLight: '#EEEDFE',
    borderLight: '#534AB7',
    textLight: '#3C3489',
    bgDark: '#3C3489',
    borderDark: '#AFA9EC',
    textDark: '#CECBF6'
  },
  {
    id: 8,
    name: 'Lantanida dan aktinida',
    bgLight: '#FAECE7',
    borderLight: '#993C1D',
    textLight: '#712B13',
    bgDark: '#712B13',
    borderDark: '#F0997B',
    textDark: '#F5C4B3'
  }
];

export function getElementGridPosition(z: number): [number, number] {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  if (z <= 4) return [2, z - 2];
  if (z <= 10) return [2, z + 8];
  if (z <= 12) return [3, z - 10];
  if (z <= 18) return [3, z];
  if (z <= 36) return [4, z - 18];
  if (z <= 54) return [5, z - 36];
  if (z <= 56) return [6, z - 54];
  if (z >= 57 && z <= 71) return [9, z - 53];
  if (z <= 86) return [6, z - 68];
  if (z <= 88) return [7, z - 86];
  if (z >= 89 && z <= 103) return [10, z - 85];
  return [7, z - 100];
}

const RAW_SHELLS: Record<string, string> = {
  H:"1",He:"2",Li:"2.1",Be:"2.2",B:"2.3",C:"2.4",N:"2.5",O:"2.6",F:"2.7",Ne:"2.8",
  Na:"2.8.1",Mg:"2.8.2",Al:"2.8.3",Si:"2.8.4",P:"2.8.5",S:"2.8.6",Cl:"2.8.7",Ar:"2.8.8",
  K:"2.8.8.1",Ca:"2.8.8.2",Sc:"2.8.9.2",Ti:"2.8.10.2",V:"2.8.11.2",Cr:"2.8.13.1",Mn:"2.8.13.2",
  Fe:"2.8.14.2",Co:"2.8.15.2",Ni:"2.8.16.2",Cu:"2.8.18.1",Zn:"2.8.18.2",Ga:"2.8.18.3",Ge:"2.8.18.4",
  As:"2.8.18.5",Se:"2.8.18.6",Br:"2.8.18.7",Kr:"2.8.18.8",Rb:"2.8.18.8.1",Sr:"2.8.18.8.2",
  Y:"2.8.18.9.2",Zr:"2.8.18.10.2",Nb:"2.8.18.12.1",Mo:"2.8.18.13.1",Tc:"2.8.18.13.2",Ru:"2.8.18.15.1",
  Rh:"2.8.18.16.1",Pd:"2.8.18.18",Ag:"2.8.18.18.1",Cd:"2.8.18.18.2",In:"2.8.18.18.3",Sn:"2.8.18.18.4",
  Sb:"2.8.18.18.5",Te:"2.8.18.18.6",I:"2.8.18.18.7",Xe:"2.8.18.18.8",Cs:"2.8.18.18.8.1",Ba:"2.8.18.18.8.2",
  La:"2.8.18.18.9.2",Ce:"2.8.18.19.9.2",Pr:"2.8.18.21.8.2",Nd:"2.8.18.22.8.2",Pm:"2.8.18.23.8.2",
  Sm:"2.8.18.24.8.2",Eu:"2.8.18.25.8.2",Gd:"2.8.18.25.9.2",Tb:"2.8.18.27.8.2",Dy:"2.8.18.28.8.2",
  Ho:"2.8.18.29.8.2",Er:"2.8.18.30.8.2",Tm:"2.8.18.31.8.2",Yb:"2.8.18.32.8.2",Lu:"2.8.18.32.9.2",
  Hf:"2.8.18.32.10.2",Ta:"2.8.18.32.11.2",W:"2.8.18.32.12.2",Re:"2.8.18.32.13.2",Os:"2.8.18.32.14.2",
  Ir:"2.8.18.32.15.2",Pt:"2.8.18.32.17.1",Au:"2.8.18.32.18.1",Hg:"2.8.18.32.18.2",Tl:"2.8.18.32.18.3",
  Pb:"2.8.18.32.18.4",Bi:"2.8.18.32.18.5",Po:"2.8.18.32.18.6",At:"2.8.18.32.18.7",Rn:"2.8.18.32.18.8",
  Fr:"2.8.18.32.18.8.1",Ra:"2.8.18.32.18.8.2",Ac:"2.8.18.32.18.9.2",Th:"2.8.18.32.18.10.2",
  Pa:"2.8.18.32.20.9.2",U:"2.8.18.32.21.9.2",Np:"2.8.18.32.22.9.2",Pu:"2.8.18.32.24.8.2",
  Am:"2.8.18.32.25.8.2",Cm:"2.8.18.32.25.9.2",Bk:"2.8.18.32.27.8.2",Cf:"2.8.18.32.28.8.2",
  Es:"2.8.18.32.29.8.2",Fm:"2.8.18.32.30.8.2",Md:"2.8.18.32.31.8.2",No:"2.8.18.32.32.8.2",
  Lr:"2.8.18.32.32.8.3",Rf:"2.8.18.32.32.10.2",Db:"2.8.18.32.32.11.2",Sg:"2.8.18.32.32.12.2",
  Bh:"2.8.18.32.32.13.2",Hs:"2.8.18.32.32.14.2",Mt:"2.8.18.32.32.15.2",Ds:"2.8.18.32.32.16.2",
  Rg:"2.8.18.32.32.17.2",Cn:"2.8.18.32.32.18.2",Nh:"2.8.18.32.32.18.3",Fl:"2.8.18.32.32.18.4",
  Mc:"2.8.18.32.32.18.5",Lv:"2.8.18.32.32.18.6",Ts:"2.8.18.32.32.18.7",Og:"2.8.18.32.32.18.8"
};

const RAW_NAMES = [
  "Hidrogen","Helium","Litium","Berilium","Boron","Karbon","Nitrogen","Oksigen","Fluorin","Neon",
  "Natrium","Magnesium","Aluminium","Silikon","Fosforus","Belerang","Klorin","Argon","Kalium","Kalsium",
  "Skandium","Titanium","Vanadium","Kromium","Mangan","Besi","Kobalt","Nikel","Tembaga","Seng",
  "Galium","Germanium","Arsen","Selenium","Bromin","Kripton","Rubidium","Stronsium","Itrium","Zirkonium",
  "Niobium","Molibdenum","Teknesium","Rutenium","Rodium","Paladium","Perak","Kadmium","Indium","Timah",
  "Antimon","Telurium","Iodin","Xenon","Sesium","Barium","Lantanum","Serium","Praseodimium","Neodimium",
  "Prometium","Samarium","Europium","Gadolinium","Terbium","Disprosium","Holmium","Erbium","Tulium","Iterbium",
  "Lutesium","Hafnium","Tantalum","Tungsten","Renium","Osmium","Iridium","Platina","Emas","Raksa",
  "Talium","Timbal","Bismut","Polonium","Astatin","Radon","Fransium","Radium","Aktinium","Torium",
  "Protaktinium","Uranium","Neptunium","Plutonium","Amerisium","Kurium","Berkelium","Kalifornium","Einsteinium","Fermium",
  "Mendelevium","Nobelium","Lawrensium","Rutherfordium","Dubnium","Seaborgium","Borium","Hasium","Meitnerium","Darmstadtium",
  "Roentgenium","Kopernisium","Nihonium","Flerovium","Moskovium","Livermorium","Tenesin","Oganeson"
];

const RAW_MASS = [
  "1,008","4,003","6,94","9,012","10,81","12,011","14,007","15,999","18,998","20,180",
  "22,990","24,305","26,982","28,085","30,974","32,06","35,45","39,948","39,098","40,078",
  "44,956","47,867","50,942","51,996","54,938","55,845","58,933","58,693","63,546","65,38",
  "69,723","72,630","74,922","78,971","79,904","83,798","85,468","87,62","88,906","91,224",
  "92,906","95,95","[98]","101,07","102,906","106,42","107,868","112,414","114,818","118,710",
  "121,760","127,60","126,904","131,293","132,905","137,327","138,905","140,116","140,908","144,242",
  "[145]","150,36","151,964","157,25","158,925","162,500","164,930","167,259","168,934","173,045",
  "174,967","178,486","180,948","183,84","186,207","190,23","192,217","195,084","196,967","200,592",
  "204,38","207,2","208,980","[209]","[210]","[222]","[223]","[226]","[227]","232,038",
  "231,036","238,029","[237]","[244]","[243]","[247]","[247]","[251]","[252]","[257]",
  "[258]","[259]","[266]","[267]","[268]","[269]","[270]","[277]","[278]","[281]",
  "[282]","[285]","[286]","[289]","[290]","[293]","[294]","[294]"
];

export const GROUP_A_NAMES: Record<number, string> = {
  1: "IA",
  2: "IIA",
  13: "IIIA",
  14: "IVA",
  15: "VA",
  16: "VIA",
  17: "VIIA",
  18: "VIIIA"
};

export const HEADER_GROUPS = [
  "IA", "IIA", "IIIB", "IVB", "VB", "VIB", "VIIB", "VIII", "VIII", "VIII", "IB", "IIB", "IIIA", "IVA", "VA", "VIA", "VIIA", "VIIIA"
];

function getCategory(z: number): number {
  if ([1, 6, 7, 8, 15, 16, 34].includes(z)) return 5;
  if ([9, 17, 35, 53, 85, 117].includes(z)) return 6;
  if ([2, 10, 18, 36, 54, 86, 118].includes(z)) return 7;
  if ([3, 11, 19, 37, 55, 87].includes(z)) return 0;
  if ([4, 12, 20, 38, 56, 88].includes(z)) return 1;
  if ([5, 14, 32, 33, 51, 52].includes(z)) return 4;
  if ([13, 31, 49, 50, 81, 82, 83, 84, 113, 114, 115, 116].includes(z)) return 3;
  if ((z >= 57 && z <= 71) || (z >= 89 && z <= 103)) return 8;
  return 2;
}

const ELEMENT_USES: Record<number, string> = {
  1: "Bahan bakar roket masa depan, sintesis pupuk amonia, dan komponen pembentuk air (H₂O) & seluruh biomolekul.",
  2: "Gas pengisi balon udara anti-ledak, pendingin magnet superkonduktor MRI rumah sakit, atmosfer penyelaman laut dalam.",
  3: "Bahan utama baterai isi ulang smartphone & mobil listrik (EV), obat penstabil suasana hati (gangguan bipolar).",
  4: "Jendela tabung sinar-X diagnostik, paduan tembaga-berilium tahan percikan pada peralatan kilang minyak.",
  5: "Kaca borosilikat Pyrex tahan panas oven, flare kembang api hijau terang, dopan semikonduktor silikon.",
  6: "Pondasi utama seluruh kehidupan di bumi (DNA, protein, karbohidrat), grafit elektroda baterai, intan perhiasan.",
  7: "Menyusun 78% atmosfer bumi, gas protektif pengemasan makanan agar tidak melempem, cairan kriogenik, pupuk urea.",
  8: "Gas vital pernapasan seluruh makhluk hidup aerobik, pembakaran industri peleburan baja, tabung oksigen medis.",
  9: "Ion fluorida penguat email gigi pada pasta gigi, wajan anti-lengket teflon (PTFE), gas pendingin AC.",
  10: "Lampu reklame neon toko berwarna jingga kemerahan terang, tabung laser He-Ne pemindai barcode supermarket.",
  11: "Komponen utama garam dapur (NaCl) penyeimbang cairan tubuh, soda kue pengembang roti, lampu jalan kabut kuning.",
  12: "Kembang api cahaya putih cerah, obat maag antasida penetral asam lambung (Mg(OH)₂), paduan bodi laptop ringan.",
  13: "Bodi kaleng minuman, konstruksi badan pesawat terbang ringan, kabel transmisi listrik tegangan tinggi, foil makanan.",
  14: "Bahan utama mikroprosesor cip komputer di seluruh dunia, sel panel surya fotovoltaik, kaca jendela & gel silika.",
  15: "Kepala pemantik korek api gesek, pupuk tanaman NPK, molekul penyimpan energi sel (ATP), pembentuk DNA & tulang.",
  16: "Cairan elektrolit asam sulfat aki kendaraan, vulkanisasi ban karet agar awet elastis, salep pengering jerawat.",
  17: "Disinfektan klorin pembasmi kuman air minum PDAM & kolam renang, pemutih pakaian, plastik pipa paralon PVC.",
  18: "Gas pelindung pengelasan logam argon TIG, pengisi bola lampu pijar agar filamen tungsten tidak terbakar oksigen.",
  19: "Elektrolit penting konduksi impuls saraf & denyut jantung manusia, pupuk kalium penyubur akar dan buah tanaman.",
  20: "Penyusun utama kekuatan tulang dan gigi, pengerasan semen dan beton bangunan gedung bertingkat, kapur tohor.",
  21: "Paduan aluminium-skandium pada rangka sepeda balap dan komponen kedirgantaraan pesawat tempur.",
  22: "Implan medis tulang & gigi tahan karat, bodi jam tangan mewah, rangka luar pesawat terbang supersonik.",
  23: "Baja paduan vanadium super kuat untuk perkakas kunci pas, tang, dan pegas suspensi mobil.",
  24: "Pelapis krom mengkilap anti-karat pada velg mobil, keran air wastafel, dan paduan baja tahan karat (stainless steel).",
  25: "Komponen penting paduan baja konstruksi rel kereta api dan bahan katoda baterai alkaline.",
  26: "Bahan logam terpenting dunia (baja konstruksi, jembatan, gedung), inti molekul hemoglobin pengangkut oksigen darah.",
  27: "Bahan katoda baterai litium-ion modern, pigmen biru kobalt keramik, radioterapi kanker (kobalt-60).",
  28: "Bahan koin uang logam, baterai nikel-metal hidrida (NiMH), pelapis anti-karat komponen mesin industri.",
  29: "Kabel penghantar listrik nomor satu di rumah tangga dan industri, pipa pendingin AC, logam kuningan & perunggu.",
  30: "Pelapis galvanis anti-karat pada atap seng dan baja, suplemen zinc penguat imunitas tubuh, baterai sel kering.",
  31: "Bahan semikonduktor LED layar smartphone, termometer suhu tinggi (cair pada suhu tangan 30°C).",
  32: "Lensa kamera inframerah penglihatan malam (night-vision), serat optik jaringan internet telekomunikasi cepat.",
  33: "Dopan transistor semikonduktor, bahan pengawet kayu industri (arsenat), laser arsenida galium.",
  34: "Sensor cahaya mesin fotokopi, pigmen kaca merah ruby, suplemen antioksidan enzim seluler tubuh.",
  35: "Bahan tahan api (flame retardant) pada tekstil & plastik elektronik, obat sedatif penenang zaman dahulu.",
  36: "Lampu kilat fotografi kecepatan tinggi, laser kripton-fluorida untuk litografi semikonduktor presisi.",
  37: "Jam atom optik berakurasi tinggi untuk satelit navigasi GPS, photocell fotosel elektronik.",
  38: "Pemberi warna merah menyala pada kembang api dan suar darurat penyelamatan malam hari.",
  39: "Laser YAG untuk operasi bedah mata, fosfor merah layar televisi, paduan superkonduktor suhu tinggi.",
  40: "Kelos pembungkus bahan bakar reaktor nuklir karena tahan korosi dan tidak menyerap neutron, batu permata zirkonia.",
  41: "Magnet superkonduktor scanner MRI rumah sakit dan akselerator partikel fisika kuantum.",
  42: "Baja tahan panas suhu tinggi pada mesin turbin jet pesawat terbang dan pelumas industri peluru bantalan.",
  43: "Unsur sintetis pertama; isotop Tc-99m adalah pelacak radiofarmasi paling populer untuk diagnosis medis organ tubuh.",
  44: "Bahan kontak listrik tahan aus pada saklar relai mikro dan katalis pengubah reaksi kimia industri.",
  45: "Katalis konverter emisi gas buang knalpot mobil untuk mengubah polutan berbahaya menjadi gas ramah.",
  46: "Katalis konverter emisi kendaraan, spons penyerap gas hidrogen, kontak konektor elektronik canggih.",
  47: "Konduktor listrik & panas terbaik dari semua unsur, perhiasan perak, cermin presisi, pasta sel surya fotovoltaik.",
  48: "Baterai isi ulang nikel-kadmium (NiCd), pelapis pelindung korosi baja di lingkungan air laut.",
  49: "Lapisan transparan konduktif ITO (Indium Tin Oxide) pada seluruh layar sentuh (touchscreen) smartphone & LCD.",
  50: "Logam timah penyolder sirkuit elektronik PCB, pelapis kaleng makanan anti-karat, paduan perunggu klasik.",
  51: "Bahan penghambat nyala api (flame retardant) pelapis kabel listrik, paduan timbal baterai aki.",
  52: "Bahan semikonduktor termoelektrik pendingin komputer tanpa kompresor, bahan pembuatan disk optik DVD-RW.",
  53: "Antiseptik povidone iodine pembersih luka terbuka, garam beryodium pencegah gondok, media kontras rontgen.",
  54: "Lampu sorot mobil xenon ultra-terang, tabung gas pendorong mesin ion pesawat penjelajah luar angkasa.",
  55: "Standar penentu waktu detik internasional melalui jam atom sesium paling presisi di dunia.",
  56: "Cairan suspensi kontras barium meal untuk pencitraan sinar-X lambung & usus, pemberi warna hijau kembang api.",
  57: "Batu pemantik korek gas, elektroda lampu busur bioskop, kaca kamera optik transmisi tinggi.",
  58: "Bahan pemoles presisi kaca optik teleskop dan layar ponsel, katalis pemurni gas buang knalpot mobil.",
  59: "Kacamata pelindung las penahan sinar silau kuning natrium, magnet permanen berkekuatan tinggi.",
  60: "Magnet neodymium (NdFeB) super kuat pada speaker ponsel, motor mobil listrik, dan generator turbin angin.",
  74: "Filamen bola lampu pijar tahan panas hingga 3.422°C, mata bor baja super keras pemotong batuan tambang.",
  78: "Perhiasan mewah tahan karat abadi, katalis konverter knalpot kendaraan, obat kemoterapi kanker (cisplatin).",
  79: "Standar moneter cadangan emas dunia, perhiasan abadi yang tidak pernah pudar, konektor audio & chip mikroprosesor.",
  80: "Logam cair pada suhu kamar; dahulu digunakan pada termometer, barometer, amalgam tambal gigi, lampu neon hemat energi.",
  82: "Pelindung radiasi sinar-X di ruang radiologi rumah sakit, pelat elektroda baterai aki mobil timbal-asam.",
  83: "Obat gangguan lambung (bismut subsalisilat/Pepto-Bismol), pengganti timbal ramah lingkungan pada peluru pancing.",
  92: "Bahan bakar pembangkit listrik tenaga nuklir (PLTN) bebas emisi karbon, penanggalan geologi usia batuan bumi.",
  94: "Bahan bakar generator termoelektrik radioisotop (RTG) pada wahana antariksa penjelajah luar angkasa Voyager & Mars Rover."
};

export const ELEMENTS: ElementData[] = Object.keys(RAW_SHELLS).map((sym, index) => {
  const z = index + 1;
  const shells = RAW_SHELLS[sym].split('.').map(Number);
  const pos = getElementGridPosition(z);
  const row = pos[0];
  const col = pos[1];
  const period = row <= 7 ? row : (row === 9 ? 6 : 7);
  const group = row <= 7 ? col : null;
  const groupName = group ? (GROUP_A_NAMES[group] || `${group}`) : 'B / Blok-f';
  const isGroupA = group !== null && Boolean(GROUP_A_NAMES[group]);
  const category = getCategory(z);
  const name = RAW_NAMES[index] || `Unsur ${z}`;
  const mass = RAW_MASS[index] || `[${z}]`;
  const valenceElectrons = shells[shells.length - 1];

  const uses = ELEMENT_USES[z] || (
    z > 100 
      ? `Unsur sintetis berat yang diproduksi di laboratorium nuklir untuk penelitian fisika kuantum dan batas kestabilan inti atom.`
      : `Digunakan dalam paduan logam teknik, katalis reaksi kimia industri modern, dan penelitian material sains.`
  );

  return {
    z,
    symbol: sym,
    name,
    mass,
    category,
    group,
    groupName,
    period,
    shells,
    valenceElectrons,
    isGroupA,
    uses
  };
});
