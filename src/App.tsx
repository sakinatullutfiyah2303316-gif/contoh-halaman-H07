import React, { useState, useMemo, useEffect } from 'react';
import { ELEMENTS, CATEGORIES, HEADER_GROUPS, getElementGridPosition, ElementData } from './data/elements';
import { sound } from './utils/sound';
import { Lock, CheckCircle2, AlertCircle, Volume2, VolumeX, RotateCcw, ArrowRight, ExternalLink } from 'lucide-react';

// Shell labels
const SHELL_NAMES = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function App() {
  // Current selected element in periodic table
  const [cur, setCur] = useState<number | null>(10); // Na default
  const [filt, setFilt] = useState<number | null>(null);
  const [audioOn, setAudioOn] = useState<boolean>(true);

  // Group A tracking for Stage 1 (must click >= 3 different A groups)
  const [clickedGroupA, setClickedGroupA] = useState<Set<string>>(() => new Set(['IA']));

  // Stage 4 tracking (must click He and Fe)
  const [clickedHe, setClickedHe] = useState<boolean>(false);
  const [clickedFe, setClickedFe] = useState<boolean>(false);

  // Active Stage (1 to 4)
  const [activeStage, setActiveStage] = useState<1 | 2 | 3 | 4>(1);
  const [unlockedStages, setUnlockedStages] = useState<{ 1: boolean; 2: boolean; 3: boolean; 4: boolean }>({
    1: true,
    2: false,
    3: false,
    4: false
  });
  const [completedStages, setCompletedStages] = useState<{ 1: boolean; 2: boolean; 3: boolean; 4: boolean }>({
    1: false,
    2: false,
    3: false,
    4: false
  });

  // Stage 1 State
  const [s1Options, setS1Options] = useState<Array<{ id: string; text: string; correct: boolean; fb: string }>>([]);
  const [s1Selected, setS1Selected] = useState<string | null>(null);
  const [s1Attempt, setS1Attempt] = useState<number>(0);
  const [s1Status, setS1Status] = useState<'idle' | 'wrong1' | 'wrong2' | 'exhausted' | 'correct'>('idle');
  const [s1FeedbackText, setS1FeedbackText] = useState<string>('');

  // Stage 2 State (2a and 2b)
  const [s2Sub, setS2Sub] = useState<'2a' | '2b'>('2a');
  const [s2Options, setS2Options] = useState<Array<{ id: string; text: string; correct: boolean; fb: string }>>([]);
  const [s2Selected, setS2Selected] = useState<string | null>(null);
  const [s2Attempt, setS2Attempt] = useState<number>(0);
  const [s2Status, setS2Status] = useState<'idle' | 'wrong1' | 'wrong2' | 'exhausted' | 'correct'>('idle');
  const [s2FeedbackText, setS2FeedbackText] = useState<string>('');
  const [s2aDone, setS2aDone] = useState<boolean>(false);
  const [s2bDone, setS2bDone] = useState<boolean>(false);

  // Stage 3 State (3a and 3b, each has Step 1 & Step 2)
  const [s3Sub, setS3Sub] = useState<'3a' | '3b'>('3a');
  const [s3Step, setS3Step] = useState<1 | 2>(1);
  const [s3Options, setS3Options] = useState<Array<{ id: string; text: string; correct: boolean; fb: string }>>([]);
  const [s3Selected, setS3Selected] = useState<string | null>(null);
  const [s3Attempt, setS3Attempt] = useState<number>(0);
  const [s3Status, setS3Status] = useState<'idle' | 'wrong1' | 'wrong2' | 'exhausted' | 'correct'>('idle');
  const [s3FeedbackText, setS3FeedbackText] = useState<string>('');
  const [s3aStep1Done, setS3aStep1Done] = useState<boolean>(false);
  const [s3aStep2Done, setS3aStep2Done] = useState<boolean>(false);
  const [s3bStep1Done, setS3bStep1Done] = useState<boolean>(false);
  const [s3bStep2Done, setS3bStep2Done] = useState<boolean>(false);

  // Stage 4 State
  const [s4Options, setS4Options] = useState<Array<{ id: string; text: string; correct: boolean; fb: string }>>([]);
  const [s4Selected, setS4Selected] = useState<string | null>(null);
  const [s4Attempt, setS4Attempt] = useState<number>(0);
  const [s4Status, setS4Status] = useState<'idle' | 'wrong1' | 'wrong2' | 'exhausted' | 'correct'>('idle');
  const [s4FeedbackText, setS4FeedbackText] = useState<string>('');

  const currentElement = cur !== null ? ELEMENTS[cur] : null;

  // Initialize Stage 1 Options (shuffled)
  useEffect(() => {
    setS1Options(
      shuffle([
        {
          id: 'a',
          text: 'Nomor golongan sama dengan jumlah kulit',
          correct: false,
          fb: 'Jumlah kulit menunjukkan periode, bukan golongan. Bandingkan lagi.'
        },
        {
          id: 'b',
          text: 'Nomor golongan sama dengan angka terakhir konfigurasi',
          correct: true,
          fb: 'Benar! Angka terakhir konfigurasi sama dengan nomor golongan A.'
        },
        {
          id: 'c',
          text: 'Nomor golongan sama dengan angka pertama konfigurasi',
          correct: false,
          fb: 'Angka pertama hampir selalu 2. Apakah itu sama dengan nomor golongannya?'
        },
        {
          id: 'd',
          text: 'Nomor golongan sama dengan nomor atom',
          correct: false,
          fb: 'Nomor atom terus bertambah, sedangkan nomor golongan berulang dari IA sampai VIIIA.'
        }
      ])
    );
  }, []);

  // Initialize Stage 2 Options based on sub-question
  const loadStage2Options = (sub: '2a' | '2b') => {
    if (sub === '2a') {
      setS2Options(
        shuffle([
          { id: 'IA', text: 'IA', correct: false, fb: 'Angka terakhir konfigurasi adalah 2, bukan 1.' },
          { id: 'IIA', text: 'IIA', correct: true, fb: 'Tepat! 2,8,2 berada di golongan IIA.' },
          { id: 'IIIA', text: 'IIIA', correct: false, fb: '3 adalah jumlah kulit (periode), bukan golongan.' },
          { id: 'VIIIA', text: 'VIIIA', correct: false, fb: '8 berada di kulit kedua, bukan kulit terluar.' }
        ])
      );
    } else {
      setS2Options(
        shuffle([
          { id: 'IIA', text: 'IIA', correct: false, fb: '2 adalah isi kulit pertama. Yang menentukan golongan adalah angka terakhir.' },
          { id: 'VA', text: 'VA', correct: true, fb: 'Tepat! 2,5 berada di golongan VA.' },
          { id: 'VIIA', text: 'VIIA', correct: false, fb: '7 adalah jumlah seluruh elektron (2+5). Golongan hanya ditentukan angka terakhir.' },
          { id: 'VIIIA', text: 'VIIIA', correct: false, fb: 'Angka 8 tidak ada di konfigurasi ini.' }
        ])
      );
    }
    setS2Selected(null);
    setS2Attempt(0);
    setS2Status('idle');
    setS2FeedbackText('');
  };

  useEffect(() => {
    loadStage2Options(s2Sub);
  }, [s2Sub]);

  // Initialize Stage 3 Options based on sub and step
  const loadStage3Options = (sub: '3a' | '3b', step: 1 | 2) => {
    if (sub === '3a') {
      if (step === 1) {
        setS3Options(
          shuffle([
            { id: '2,3', text: '2,3', correct: true, fb: 'Tepat! Konfigurasi elektron boron (B) adalah 2,3.' },
            { id: '2,2,1', text: '2,2,1', correct: false, fb: 'Kulit kedua diisi sampai 8 dulu sebelum kulit ketiga terisi.' },
            { id: '3,2', text: '3,2', correct: false, fb: 'Kulit pertama maksimal 2 elektron, jadi urutannya tidak bisa 3 dulu.' },
            { id: '5', text: '5', correct: false, fb: '5 adalah jumlah seluruh elektron. Konfigurasi menunjukkan elektron di tiap kulit.' }
          ])
        );
      } else {
        setS3Options(
          shuffle([
            { id: '2', text: '2', correct: false, fb: '2 adalah jumlah kulit boron, bukan elektron valensi.' },
            { id: '3', text: '3', correct: true, fb: 'Tepat! Elektron valensi boron adalah 3.' },
            { id: '5', text: '5', correct: false, fb: '5 adalah nomor atom, bukan elektron valensi.' },
            { id: '8', text: '8', correct: false, fb: '8 adalah jumlah untuk oktet. Boron tidak punya sebanyak itu di kulit terluarnya.' }
          ])
        );
      }
    } else {
      if (step === 1) {
        setS3Options(
          shuffle([
            { id: '2,8,6', text: '2,8,6', correct: true, fb: 'Tepat! Konfigurasi elektron belerang (S) adalah 2,8,6.' },
            { id: '2,6,8', text: '2,6,8', correct: false, fb: 'Kulit kedua harus penuh (8) dulu sebelum kulit ketiga terisi.' },
            { id: '8,8', text: '8,8', correct: false, fb: 'Kulit pertama maksimal 2 elektron.' },
            { id: '16', text: '16', correct: false, fb: '16 adalah nomor atom. Konfigurasi menunjukkan elektron di tiap kulit.' }
          ])
        );
      } else {
        setS3Options(
          shuffle([
            { id: '3', text: '3', correct: false, fb: '3 adalah jumlah kulit (periode) belerang, bukan elektron valensi.' },
            { id: '6', text: '6', correct: true, fb: 'Tepat! Elektron valensi belerang adalah 6.' },
            { id: '8', text: '8', correct: false, fb: '8 adalah jumlah untuk oktet. Belerang belum mencapainya.' },
            { id: '16', text: '16', correct: false, fb: '16 adalah nomor atom, bukan elektron valensi.' }
          ])
        );
      }
    }
    setS3Selected(null);
    setS3Attempt(0);
    setS3Status('idle');
    setS3FeedbackText('');
  };

  useEffect(() => {
    loadStage3Options(s3Sub, s3Step);
  }, [s3Sub, s3Step]);

  // Initialize Stage 4 Options
  useEffect(() => {
    setS4Options(
      shuffle([
        {
          id: 'a',
          text: 'Pola berlaku untuk semua unsur di tabel',
          correct: false,
          fb: 'Periksa He dan Fe. Apakah angka konfigurasinya sama dengan nomor golongannya?'
        },
        {
          id: 'b',
          text: 'Pola berlaku untuk golongan A, tetapi He dan golongan B memiliki aturan berbeda',
          correct: true,
          fb: 'Benar! Kamu menemukan batas pola ini. He (konfigurasi 2) tidak sama dengan nomor golongannya (VIIIA), dan Fe (angka terakhir 2, golongan VIIIB) juga tidak mengikuti pola golongan A.'
        },
        {
          id: 'c',
          text: 'Pola berlaku untuk semua unsur, kecuali He',
          correct: false,
          fb: 'Fe juga tidak cocok dengan pola. Bandingkan angka terakhir konfigurasinya dengan golongannya.'
        },
        {
          id: 'd',
          text: 'Pola hanya berlaku untuk unsur periode 1 sampai 3',
          correct: false,
          fb: 'Coba klik K (periode 4, golongan IA). Polanya tetap berlaku, jadi periode bukan penyebabnya.'
        }
      ])
    );
  }, []);

  // Element Selection Handler
  const handleSelectElement = (idx: number) => {
    sound.playClick();
    setCur(idx);
    const el = ELEMENTS[idx];

    // Track Group A for Stage 1
    if (el.isGroupA && el.groupName) {
      setClickedGroupA((prev) => new Set([...prev, el.groupName]));
    }

    // Track He and Fe for Stage 4
    if (el.symbol === 'He') setClickedHe(true);
    if (el.symbol === 'Fe') setClickedFe(true);
  };

  const handleCategoryFilter = (catId: number) => {
    sound.playClick();
    setFilt((prev) => (prev === catId ? null : catId));
  };

  // Stage 1 Verification on PERIKSA
  const handleCheckStage1 = () => {
    if (!s1Selected) return;
    const option = s1Options.find((o) => o.id === s1Selected);
    if (!option) return;

    if (option.correct) {
      sound.playSuccess();
      setS1Status('correct');
      setS1FeedbackText(option.fb);
      setCompletedStages((prev) => ({ ...prev, 1: true }));
      setUnlockedStages((prev) => ({ ...prev, 2: true }));
    } else {
      sound.playWrong();
      const nextAtt = s1Attempt + 1;
      setS1Attempt(nextAtt);
      if (nextAtt === 1) {
        setS1Status('wrong1');
        setS1FeedbackText(`BELUM TEPAT. ${option.fb} Petunjuk 1: Bandingkan nomor golongan dengan angka di ujung kanan konfigurasi.`);
      } else if (nextAtt === 2) {
        setS1Status('wrong2');
        setS1FeedbackText(`MASIH BELUM TEPAT. Petunjuk 2: Coba klik unsur dari golongan yang berbeda. Apakah hubungannya tetap sama?`);
      } else {
        setS1Status('exhausted');
        setS1FeedbackText(`KESEMPATAN HABIS (perlu direview). Jawaban yang benar: b. Nomor golongan sama dengan angka terakhir konfigurasi. Untuk lanjut, pilih jawaban b.`);
      }
    }
  };

  // Stage 2 Verification on PERIKSA
  const handleCheckStage2 = () => {
    if (!s2Selected) return;
    const option = s2Options.find((o) => o.id === s2Selected);
    if (!option) return;

    if (option.correct) {
      sound.playSuccess();
      setS2Status('correct');
      if (s2Sub === '2a') {
        setS2aDone(true);
        // Highlight Mg (Z=12, idx=11) in table
        setCur(11);
        setS2FeedbackText(`Benar! 2,8,2 adalah Mg, golongan IIA.`);
      } else {
        setS2bDone(true);
        // Highlight N (Z=7, idx=6) in table
        setCur(6);
        setS2FeedbackText(`Benar! 2,5 adalah N, golongan VA.`);
        setCompletedStages((prev) => ({ ...prev, 2: true }));
        setUnlockedStages((prev) => ({ ...prev, 3: true }));
      }
    } else {
      sound.playWrong();
      const nextAtt = s2Attempt + 1;
      setS2Attempt(nextAtt);
      if (nextAtt === 1) {
        setS2Status('wrong1');
        setS2FeedbackText(`BELUM TEPAT. ${option.fb} Petunjuk 1: Lihat angka terakhir pada konfigurasi.`);
      } else if (nextAtt === 2) {
        setS2Status('wrong2');
        setS2FeedbackText(`MASIH BELUM TEPAT. Petunjuk 2: Pakai pola dari Tahap 1: angka terakhir konfigurasi sama dengan nomor golongan A.`);
      } else {
        const correctAns = s2Sub === '2a' ? 'IIA' : 'VA';
        setS2Status('exhausted');
        setS2FeedbackText(`KESEMPATAN HABIS (perlu direview). Jawaban yang benar: golongan ${correctAns}. Untuk lanjut, pilih ${correctAns}.`);
      }
    }
  };

  // Stage 3 Verification on PERIKSA
  const handleCheckStage3 = () => {
    if (!s3Selected) return;
    const option = s3Options.find((o) => o.id === s3Selected);
    if (!option) return;

    if (option.correct) {
      sound.playSuccess();
      setS3Status('correct');
      if (s3Sub === '3a') {
        if (s3Step === 1) {
          setS3aStep1Done(true);
          setS3FeedbackText(`Benar! Konfigurasi boron (B) adalah 2,3.`);
        } else {
          setS3aStep2Done(true);
          // Highlight B (Z=5, idx=4)
          setCur(4);
          setS3FeedbackText(`B: nomor atom 5 → 2,3 → 3 elektron valensi. B berada di golongan IIIA, cocok dengan polamu.`);
        }
      } else {
        if (s3Step === 1) {
          setS3bStep1Done(true);
          setS3FeedbackText(`Benar! Konfigurasi belerang (S) adalah 2,8,6.`);
        } else {
          setS3bStep2Done(true);
          // Highlight S (Z=16, idx=15)
          setCur(15);
          setS3FeedbackText(`S: nomor atom 16 → 2,8,6 → 6 elektron valensi. S berada di golongan VIA, cocok dengan polamu.`);
          setCompletedStages((prev) => ({ ...prev, 3: true }));
          setUnlockedStages((prev) => ({ ...prev, 4: true }));
        }
      }
    } else {
      sound.playWrong();
      const nextAtt = s3Attempt + 1;
      setS3Attempt(nextAtt);
      if (nextAtt === 1) {
        setS3Status('wrong1');
        const hint = s3Step === 1 
          ? "Petunjuk: Isi dari kulit terdalam: kulit pertama maksimal 2, kulit kedua maksimal 8."
          : "Petunjuk: Elektron valensi adalah elektron di kulit terluar, yaitu angka terakhir konfigurasi.";
        setS3FeedbackText(`BELUM TEPAT. ${option.fb} ${hint}`);
      } else if (nextAtt === 2) {
        setS3Status('wrong2');
        const hint = s3Step === 1
          ? "Petunjuk 2: Kulit pertama K terisi 2e⁻, lalu sisa elektron mengisi kulit berikutnya."
          : "Petunjuk 2: Perhatikan angka paling kanan pada konfigurasi elektronnya.";
        setS3FeedbackText(`MASIH BELUM TEPAT. ${hint}`);
      } else {
        const correctId = s3Options.find((o) => o.correct)?.id || '';
        setS3Status('exhausted');
        setS3FeedbackText(`KESEMPATAN HABIS (perlu direview). Jawaban yang benar: ${correctId}. Untuk lanjut, pilih ${correctId}.`);
      }
    }
  };

  // Stage 4 Verification on PERIKSA
  const handleCheckStage4 = () => {
    if (!s4Selected) return;
    const option = s4Options.find((o) => o.id === s4Selected);
    if (!option) return;

    if (option.correct) {
      sound.playSuccess();
      setS4Status('correct');
      setS4FeedbackText(option.fb);
      setCompletedStages((prev) => ({ ...prev, 4: true }));
    } else {
      sound.playWrong();
      const nextAtt = s4Attempt + 1;
      setS4Attempt(nextAtt);
      if (nextAtt === 1) {
        setS4Status('wrong1');
        setS4FeedbackText(`BELUM TEPAT. ${option.fb} Petunjuk 1: Apakah angka konfigurasi He sama dengan nomor golongannya (VIIIA)?`);
      } else if (nextAtt === 2) {
        setS4Status('wrong2');
        setS4FeedbackText(`MASIH BELUM TEPAT. Petunjuk 2: Bandingkan angka terakhir konfigurasi Fe dengan golongannya. Apakah Fe berada di golongan A?`);
      } else {
        setS4Status('exhausted');
        setS4FeedbackText(`KESEMPATAN HABIS (perlu direview). Jawaban yang benar: b. Pola berlaku untuk golongan A, tetapi He dan golongan B memiliki aturan berbeda. Untuk lanjut, pilih jawaban b.`);
      }
    }
  };

  // Restart Entire Flow
  const handleResetAll = () => {
    sound.playClick();
    setActiveStage(1);
    setUnlockedStages({ 1: true, 2: false, 3: false, 4: false });
    setCompletedStages({ 1: false, 2: false, 3: false, 4: false });

    setS1Selected(null);
    setS1Attempt(0);
    setS1Status('idle');
    setS1FeedbackText('');

    setS2Sub('2a');
    setS2aDone(false);
    setS2bDone(false);
    loadStage2Options('2a');

    setS3Sub('3a');
    setS3Step(1);
    setS3aStep1Done(false);
    setS3aStep2Done(false);
    setS3bStep1Done(false);
    setS3bStep2Done(false);
    loadStage3Options('3a', 1);

    setS4Selected(null);
    setS4Attempt(0);
    setS4Status('idle');
    setS4FeedbackText('');

    setCur(10);
    setClickedGroupA(new Set(['IA']));
    setClickedHe(false);
    setClickedFe(false);
  };

  // SVG Bohr Model Render
  // Rule: outermost shell yellow pulsing (.pu), last number is NOT emphasized (looks uniform)
  const renderBohrSVG = (el: ElementData) => {
    const n = el.shells.length;
    const R = [24, 34, 44, 54, 64, 74, 84];
    const er = n > 3 ? 3.2 : 4;

    return (
      <svg
        viewBox="0 0 200 200"
        width="190"
        height="190"
        role="img"
        className="overflow-visible select-none"
        aria-label={`Model Bohr ${el.name}`}
      >
        <title>Model Bohr {el.name} ({el.symbol})</title>

        {/* Orbits */}
        {el.shells.map((count, k) => {
          const r = R[k];
          const isValence = k === n - 1;
          return (
            <circle
              key={`orbit-${k}`}
              cx="100"
              cy="100"
              r={r}
              fill="none"
              stroke={isValence ? 'rgba(239, 159, 39, 0.65)' : 'var(--border-strong, #cbd5e1)'}
              strokeWidth={isValence ? 1.5 : 1}
              strokeDasharray={isValence ? 'none' : '4 3'}
            />
          );
        })}

        {/* Nucleus */}
        <g>
          <circle cx="100" cy="100" r="14" fill="#64748b" />
          <text x="100" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#ffffff">
            {el.z}p
          </text>
        </g>

        {/* Electrons */}
        {el.shells.map((m, k) => {
          const r = R[k];
          const isValence = k === n - 1;
          const electrons = [];

          for (let j = 0; j < m; j++) {
            const an = (2 * Math.PI * j) / m - Math.PI / 2 + k * 0.5;
            const x = (100 + r * Math.cos(an)).toFixed(1);
            const y = (100 + r * Math.sin(an)).toFixed(1);

            electrons.push(
              <g key={`e-${k}-${j}`}>
                {isValence && (
                  <circle
                    cx={x}
                    cy={y}
                    r={er + 2}
                    fill="#EF9F27"
                    opacity="0.3"
                    className="animate-pulse"
                  />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={er}
                  fill={isValence ? '#EF9F27' : '#64748b'}
                  stroke="#ffffff"
                  strokeWidth="0.8"
                  className={isValence ? 'pu' : ''}
                />
              </g>
            );
          }
          return <g key={`shell-electrons-${k}`}>{electrons}</g>;
        })}
      </svg>
    );
  };

  // Rule Stage 3:
  // "Klik unsur hanya menampilkan nama dan nomor atom. Konfigurasi, model Bohr, dan golongan terkunci sampai Langkah 2 soal tersebut benar."
  // "Header golongan di atas tabel disembunyikan, dan muncul kembali setelah Tahap 3 selesai."
  const isStage3Active = activeStage === 3;
  const isStage3BUnlocked = s3aStep2Done;
  const isStage3SUnlocked = s3bStep2Done;

  const isCurrentElementLockedInStage3 = useMemo(() => {
    if (!isStage3Active) return false;
    if (!currentElement) return false;
    if (currentElement.symbol === 'B') return !s3aStep2Done;
    if (currentElement.symbol === 'S') return !s3bStep2Done;
    // Any other element during Stage 3 is locked for configuration/bohr/group
    return true;
  }, [isStage3Active, currentElement, s3aStep2Done, s3bStep2Done]);

  // Stage 1 unlock requirement: >= 3 different A groups clicked
  const canUnlockStage1Question = clickedGroupA.size >= 3;

  // Stage 4 unlock requirement: He and Fe clicked
  const canUnlockStage4Question = clickedHe && clickedFe;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-3 sm:p-5 flex flex-col items-center select-none font-sans">
      <div className="w-full max-w-6xl flex flex-col gap-3.5">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-1 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              APA HUBUNGAN GOLONGAN A DENGAN ELEKTRON VALENSI?
            </h1>
            <p className="text-xs text-slate-500">
              Modul interaktif 4 tahap dengan inkuiri terbimbing
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !audioOn;
                setAudioOn(next);
                sound.enabled = next;
                sound.playClick();
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              title={audioOn ? 'Suara aktif' : 'Suara mati'}
            >
              {audioOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 4-Stage Stepper Navigation */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
          {[
            { num: 1, title: 'T1: Menemukan pola' },
            { num: 2, title: 'T2: Memakai pola' },
            { num: 3, title: 'T3: Membuktikan pola' },
            { num: 4, title: 'T4: Menguji batas pola' }
          ].map((st) => {
            const isUnlocked = unlockedStages[st.num as 1 | 2 | 3 | 4];
            const isCompleted = completedStages[st.num as 1 | 2 | 3 | 4];
            const isActive = activeStage === st.num;

            return (
              <button
                key={st.num}
                disabled={!isUnlocked}
                onClick={() => {
                  sound.playClick();
                  setActiveStage(st.num as 1 | 2 | 3 | 4);
                }}
                className={`p-2 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm font-bold'
                    : isCompleted
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300 cursor-pointer hover:bg-emerald-100'
                    : isUnlocked
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-100'
                    : 'bg-slate-100 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="truncate text-xs font-semibold">
                  {st.title}
                </div>
                <div>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : !isUnlocked ? (
                    <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic AI Tutor Instruction Bar (follows the currently active stage) */}
        <div className="p-3.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 rounded-xl text-xs sm:text-sm text-blue-950 dark:text-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="font-bold px-2 py-0.5 rounded-md bg-blue-600 text-white text-xs shrink-0 mt-0.5">
              AI Tutor
            </span>
            <p className="leading-relaxed">
              {activeStage === 1 &&
                '“Klik tiga unsur dari tiga golongan A yang berbeda. Perhatikan nomor golongan dan konfigurasi elektronnya, lalu jawab pertanyaan di bawah.”'}
              {activeStage === 2 &&
                '“Sekarang gunakan polanya. Soal hanya memberi konfigurasi, jadi tentukan golongannya. Setelah menjawab, cek di tabel.”'}
              {activeStage === 3 &&
                '“Sekarang buktikan polanya. Cari unsurnya di tabel dan lihat nomor atomnya. Tentukan konfigurasi elektronnya, lalu elektron valensinya.”'}
              {activeStage === 4 &&
                '“Klik He dan Fe. Bandingkan golongan dan konfigurasinya dengan pola tadi.”'}
            </p>
          </div>

          {/* Quick Instruction Buttons (named elements only, no config or group!) */}
          {activeStage === 4 && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleSelectElement(1)} // He (Z=2, idx=1)
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-bold text-blue-800 dark:text-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                Klik He
              </button>
              <button
                onClick={() => handleSelectElement(25)} // Fe (Z=26, idx=25)
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-blue-300 dark:border-blue-700 rounded-lg text-xs font-bold text-blue-800 dark:text-blue-200 hover:bg-blue-100 cursor-pointer"
              >
                Klik Fe
              </button>
            </div>
          )}
        </div>

        {/* 1. Panel Referensi: Periodic Table (Open & Clickable in all stages) */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xs flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Tabel Periodik Unsur
            </span>
            {activeStage === 3 && (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                (Header golongan disembunyikan sementara pada Tahap 3)
              </span>
            )}
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryFilter(cat.id)}
                style={{
                  backgroundColor: cat.bgLight,
                  borderColor: cat.borderLight,
                  color: cat.textLight
                }}
                className={`px-2 py-0.5 text-[11px] font-semibold rounded-md border transition-all cursor-pointer ${
                  filt === cat.id ? 'ring-2 ring-slate-900 dark:ring-white scale-102 font-bold shadow-xs' : 'opacity-90 hover:opacity-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* 18-Column Periodic Grid */}
          <div className="overflow-x-auto pt-1 pb-1">
            <div className="min-w-[660px]">
              {/* Group Headers (Hidden during Stage 3, reappears after Stage 3 is completed) */}
              {!isStage3Active && (
                <div className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-0.5 mb-1 text-center">
                  {HEADER_GROUPS.map((h, i) => (
                    <div
                      key={`hd-${i}`}
                      className="text-[10px] font-bold py-0.5 text-slate-400"
                    >
                      {h}
                    </div>
                  ))}
                </div>
              )}

              {/* Elements Matrix Grid */}
              <div
                className="grid grid-cols-[repeat(18,minmax(0,1fr))] gap-0.5"
                style={{
                  gridTemplateRows: 'repeat(7, 40px) 6px repeat(2, 40px)'
                }}
              >
                {ELEMENTS.map((el, i) => {
                  const p = getElementGridPosition(el.z);
                  const cat = CATEGORIES[el.category];
                  const isCur = cur === i;
                  const isDim = filt !== null && el.category !== filt;

                  return (
                    <button
                      key={el.z}
                      onClick={() => handleSelectElement(i)}
                      style={{
                        gridRow: p[0],
                        gridColumn: p[1],
                        backgroundColor: cat.bgLight,
                        borderColor: cat.borderLight,
                        color: cat.textLight
                      }}
                      className={`relative flex flex-col items-center justify-center p-0.5 rounded-sm border cursor-pointer transition-all duration-100 ${
                        isCur
                          ? 'outline-2 outline-slate-900 dark:outline-white outline-offset-1 z-20 scale-108 font-bold shadow-xs'
                          : 'border-[0.5px]'
                      } ${isDim ? 'opacity-25' : 'hover:brightness-95'}`}
                      title={`${el.z}. ${el.name} (${el.symbol})`}
                    >
                      <span className="text-[10px] leading-none self-start pl-0.5 font-mono opacity-80">
                        {el.z}
                      </span>
                      <span className="text-[13px] font-bold leading-tight -mt-0.5">
                        {el.symbol}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Detail Inspector Panel (Unified submicroscopic Bohr & symbolic configuration) */}
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-xl p-3 sm:p-4 flex flex-wrap items-center gap-4 min-h-[210px] relative">
            {currentElement === null ? (
              <p className="text-xs sm:text-sm text-slate-500 mx-auto">
                Klik salah satu unsur untuk melihat datanya dan model Bohr.
              </p>
            ) : isCurrentElementLockedInStage3 ? (
              // Stage 3 Locked State Rule
              <div className="w-full flex flex-col items-center justify-center py-6 text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {currentElement.name} ({currentElement.symbol}) — Nomor Atom: {currentElement.z}
                </div>
                <p className="text-xs text-slate-500 max-w-md">
                  Konfigurasi elektron, model Bohr, dan golongan terkunci sementara pada Tahap 3. Selesaikan Langkah 1 & 2 pada pertanyaan di bawah untuk membuktikannya.
                </p>
              </div>
            ) : (
              <>
                {/* Bohr Model: outermost shell pulsing yellow (.pu) */}
                <div className="flex flex-col items-center shrink-0">
                  {renderBohrSVG(currentElement)}
                </div>

                {/* Element Badge Box (Atomic number, symbol, name, mass) */}
                {(() => {
                  const cat = CATEGORIES[currentElement.category];
                  return (
                    <div
                      style={{
                        backgroundColor: cat.bgLight,
                        borderColor: cat.borderLight,
                        color: cat.textLight
                      }}
                      className="border rounded-xl w-28 sm:w-32 p-2.5 text-center flex flex-col justify-between shrink-0 shadow-2xs select-none"
                    >
                      <div className="text-xs font-mono font-bold text-left">
                        {currentElement.z}
                      </div>
                      <div className="text-3xl sm:text-4xl font-black leading-none my-1">
                        {currentElement.symbol}
                      </div>
                      <div className="text-xs font-bold truncate">
                        {currentElement.name}
                      </div>
                      <div className="text-[11px] font-mono mt-0.5 opacity-85">
                        {currentElement.mass}
                      </div>
                    </div>
                  );
                })()}

                {/* Metadata Column */}
                {/* Rules: DOES NOT write "Elektron valensi: n", last number in config is NOT given emphasis (no underline or special color) */}
                <div className="text-xs sm:text-sm flex flex-col gap-1.5 flex-1 min-w-[220px]">
                  <div>
                    <span className="text-slate-500">Golongan: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {currentElement.isGroupA ? currentElement.groupName : 'B / blok f (di luar cakupan)'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">Periode: </span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {currentElement.period}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500">Kategori: </span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {CATEGORIES[currentElement.category].name}
                    </span>
                  </div>

                  {/* Uniform Configuration Pill (no underline, no special color on the last number) */}
                  <div className="mt-1 flex items-center">
                    <span className="px-3 py-1.5 rounded-xl bg-blue-100 dark:bg-blue-950/80 border border-blue-300 dark:border-blue-800 text-blue-900 dark:text-blue-100 font-mono text-base font-bold shadow-2xs">
                      {currentElement.symbol}: {currentElement.shells.join(',')}
                    </span>
                  </div>

                  {/* Manfaat & Kegunaan */}
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/60 text-xs">
                    <span className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5 mb-0.5">
                      💡 Manfaat & Kegunaan:
                    </span>
                    <p className="text-amber-950 dark:text-amber-100 leading-relaxed text-[11px] sm:text-xs">
                      {currentElement.uses}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 3. The 4 Stages Interactive Questions Area */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col gap-4">
          {/* ===================== TAHAP 1 ===================== */}
          {activeStage === 1 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Tahap 1/4: Temukan pola (tidak dinilai)
                </span>
                <span className="text-xs text-slate-500">
                  Golongan A diklik: <b className="text-blue-600 dark:text-blue-400">{clickedGroupA.size}/3</b>
                </span>
              </div>

              {!canUnlockStage1Question ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    Klik minimal 3 unsur dari 3 golongan A berbeda (misal IA, IIA, IIIA) pada tabel di atas untuk membuka pertanyaan di bawah.
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    Apa hubungan antara nomor golongan dan konfigurasi elektron unsur-unsur yang kamu klik?
                  </p>

                  {/* Options (shuffled) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {s1Options.map((opt) => {
                      const isSelected = s1Selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (s1Status !== 'correct') {
                              sound.playClick();
                              setS1Selected(opt.id);
                            }
                          }}
                          className={`p-3 text-left rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100 font-bold ring-2 ring-blue-400/40'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold uppercase">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Button: PERIKSA */}
                  {s1Status !== 'correct' && (
                    <div className="flex justify-end pt-1">
                      <button
                        disabled={!s1Selected}
                        onClick={handleCheckStage1}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                          s1Selected
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-98'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        PERIKSA
                      </button>
                    </div>
                  )}

                  {/* Feedback Message */}
                  {s1FeedbackText && (
                    <div
                      className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                        s1Status === 'correct'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-100'
                          : s1Status === 'exhausted'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100'
                          : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-950 dark:text-red-100'
                      }`}
                    >
                      {s1FeedbackText}
                    </div>
                  )}

                  {s1Status === 'correct' && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => {
                          sound.playClick();
                          setActiveStage(2);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>Lanjut ke Tahap 2</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ===================== TAHAP 2 ===================== */}
          {activeStage === 2 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Tahap 2/4: Konfigurasi → Golongan ({s2Sub === '2a' ? 'Soal 2a' : 'Soal 2b'})
                </span>
                <span className="text-xs text-slate-400">
                  {s2Sub === '2a' ? 'Pertanyaan 1 dari 2' : 'Pertanyaan 2 dari 2'}
                </span>
              </div>

              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {s2Sub === '2a'
                  ? 'Atom dengan konfigurasi 2,8,2 berada di golongan...'
                  : 'Atom dengan konfigurasi 2,5 berada di golongan...'}
              </p>

              {/* Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {s2Options.map((opt) => {
                  const isSelected = s2Selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (s2Status !== 'correct') {
                          sound.playClick();
                          setS2Selected(opt.id);
                        }
                      }}
                      className={`p-3 text-center rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-400/40'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Action Button: PERIKSA */}
              {s2Status !== 'correct' && (
                <div className="flex justify-end pt-1">
                  <button
                    disabled={!s2Selected}
                    onClick={handleCheckStage2}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      s2Selected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-98'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    PERIKSA
                  </button>
                </div>
              )}

              {/* Feedback Message */}
              {s2FeedbackText && (
                <div
                  className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                    s2Status === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-100'
                      : s2Status === 'exhausted'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-950 dark:text-red-100'
                  }`}
                >
                  {s2FeedbackText}
                </div>
              )}

              {/* After 2a is correct, proceed to 2b */}
              {s2Sub === '2a' && s2aDone && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setS2Sub('2b');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Soal 2b</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* After 2b is correct, proceed to Stage 3 */}
              {s2Sub === '2b' && s2bDone && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveStage(3);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Tahap 3</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAHAP 3 ===================== */}
          {activeStage === 3 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Tahap 3/4: Membuktikan pola dari nomor atom ({s3Sub === '3a' ? 'Boron - B' : 'Belerang - S'})
                </span>
                <span className="text-xs text-slate-500 font-semibold">
                  Langkah {s3Step} dari 2
                </span>
              </div>

              {/* Question Text */}
              <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                {s3Sub === '3a'
                  ? s3Step === 1
                    ? 'Soal 3a - Langkah 1: Konfigurasi elektron atom boron (B) adalah...'
                    : 'Soal 3a - Langkah 2: Berapa elektron valensi boron?'
                  : s3Step === 1
                  ? 'Soal 3b - Langkah 1: Konfigurasi elektron atom belerang (S) adalah...'
                  : 'Soal 3b - Langkah 2: Berapa elektron valensi belerang?'}
              </p>

              {/* Options */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {s3Options.map((opt) => {
                  const isSelected = s3Selected === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        if (s3Status !== 'correct') {
                          sound.playClick();
                          setS3Selected(opt.id);
                        }
                      }}
                      className={`p-3 text-center rounded-xl border text-sm font-bold transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100 ring-2 ring-blue-400/40'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>

              {/* Action Button: PERIKSA */}
              {s3Status !== 'correct' && (
                <div className="flex justify-end pt-1">
                  <button
                    disabled={!s3Selected}
                    onClick={handleCheckStage3}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                      s3Selected
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-98'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    PERIKSA
                  </button>
                </div>
              )}

              {/* Feedback Message */}
              {s3FeedbackText && (
                <div
                  className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                    s3Status === 'correct'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-100'
                      : s3Status === 'exhausted'
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100'
                      : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-950 dark:text-red-100'
                  }`}
                >
                  {s3FeedbackText}
                </div>
              )}

              {/* Next Step inside 3a */}
              {s3Sub === '3a' && s3Step === 1 && s3aStep1Done && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setS3Step(2);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Langkah 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Next Question from 3a to 3b */}
              {s3Sub === '3a' && s3Step === 2 && s3aStep2Done && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setS3Sub('3b');
                      setS3Step(1);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Soal 3b (Belerang)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Next Step inside 3b */}
              {s3Sub === '3b' && s3Step === 1 && s3bStep1Done && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      sound.playClick();
                      setS3Step(2);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Langkah 2</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Kesimpulan Tahap 3 (after 3b complete) */}
              {s3bStep2Done && (
                <div className="mt-2 p-3.5 bg-blue-50/90 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 rounded-xl flex flex-col gap-2 text-xs sm:text-sm text-blue-950 dark:text-blue-100">
                  <p className="font-bold">Kesimpulan Tahap 3:</p>
                  <p className="leading-relaxed">
                    “Pada B dan S, nomor golongan sama dengan elektron valensi yang kamu hitung dari nomor atom. Karena itu, untuk golongan A kamu bisa memperkirakan elektron valensi langsung dari nomor golongannya.”
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        sound.playClick();
                        setActiveStage(4);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>Lanjut ke Tahap 4</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ===================== TAHAP 4 ===================== */}
          {activeStage === 4 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Tahap 4/4: Menguji batas pola
                </span>
                <span className="text-xs text-slate-500">
                  Unsur diuji: He {clickedHe ? '✓' : '○'}, Fe {clickedFe ? '✓' : '○'}
                </span>
              </div>

              {!canUnlockStage4Question ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs sm:text-sm text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>
                    Klik <b>He</b> dan <b>Fe</b> (menggunakan tombol di atas atau langsung pada tabel) untuk membuka pertanyaan Tahap 4.
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">
                    Setelah membandingkan He dan Fe dengan pola tadi, pernyataan mana yang paling tepat?
                  </p>

                  {/* Options (shuffled) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {s4Options.map((opt) => {
                      const isSelected = s4Selected === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            if (s4Status !== 'correct') {
                              sound.playClick();
                              setS4Selected(opt.id);
                            }
                          }}
                          className={`p-3 text-left rounded-xl border text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950 border-blue-500 text-blue-900 dark:text-blue-100 font-bold ring-2 ring-blue-400/40'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <span className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 font-bold uppercase">
                            {opt.id}
                          </span>
                          <span>{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Action Button: PERIKSA */}
                  {s4Status !== 'correct' && (
                    <div className="flex justify-end pt-1">
                      <button
                        disabled={!s4Selected}
                        onClick={handleCheckStage4}
                        className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                          s4Selected
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-98'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        PERIKSA
                      </button>
                    </div>
                  )}

                  {/* Feedback Message */}
                  {s4FeedbackText && (
                    <div
                      className={`p-3 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                        s4Status === 'correct'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-950 dark:text-emerald-100'
                          : s4Status === 'exhausted'
                          ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-950 dark:text-amber-100'
                          : 'bg-red-50 dark:bg-red-950/40 border-red-300 text-red-950 dark:text-red-100'
                      }`}
                    >
                      {s4FeedbackText}
                    </div>
                  )}

                  {/* Klarifikasi Akhir (setelah Tahap 4 benar) */}
                  {s4Status === 'correct' && (
                    <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col gap-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <div className="font-bold text-blue-700 dark:text-blue-300 text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Klarifikasi Akhir:</span>
                      </div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100">
                        Catatan penting: pola ini berlaku untuk golongan A.
                      </p>
                      <p>
                        Untuk golongan A, nomor golongan sama dengan jumlah elektron valensi (angka terakhir konfigurasi).
                      </p>
                      <ul className="list-disc pl-5 flex flex-col gap-1.5 leading-relaxed text-slate-700 dark:text-slate-300">
                        <li>
                          <b>Helium (He)</b> ada di golongan VIIIA, tetapi hanya punya 2 elektron valensi karena kulit pertamanya sudah penuh dengan 2 elektron (duplet).
                        </li>
                        <li>
                          <b>Golongan B (logam transisi)</b>, misalnya Fe (2,8,14,2, golongan VIIIB), tidak mengikuti pola ini. Elektron valensinya tidak bisa dibaca dari angka terakhir konfigurasi.
                        </li>
                        <li>
                          <b>Modul ini hanya membahas golongan A.</b>
                        </li>
                      </ul>

                      {/* Final Action Buttons: Lanjut ke M1-H08 & Ulangi Seluruh Tahap */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={handleResetAll}
                          className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs sm:text-sm flex items-center gap-1.5 cursor-pointer"
                        >
                          <RotateCcw className="w-4 h-4" />
                          <span>Ulangi Seluruh Tahap</span>
                        </button>

                        <button
                          onClick={() => {
                            sound.playSuccess();
                            alert("Mengarahkan siswa ke modul berikutnya: M1-H08!");
                          }}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <span>Lanjut ke M1-H08</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
