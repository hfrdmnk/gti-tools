import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, ChevronRight, ChevronLeft, Calculator, BookOpen, Settings } from 'lucide-react';

const BinaryDivision = () => {
  // Inputs
  const [dividend, setDividend] = useState(11);
  const [divisor, setDivisor] = useState(3);
  const [method, setMethod] = useState('restoring'); // 'restoring' or 'non-restoring'

  // State
  const [history, setHistory] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [bitWidth, setBitWidth] = useState(4); // Default 4 bits

  // Helper: To Binary String with padding
  const toBin = (num, bits) => {
    let binary = (num >>> 0).toString(2); // Handle unsigned
    // If negative (simulated with large unsigned numbers in JS), handle 2's complement visual
    if (num < 0) {
       // Manual 2's complement for N bits
       const maxVal = Math.pow(2, bits);
       binary = (maxVal + num).toString(2);
    }

    while (binary.length < bits) {
      binary = "0" + binary;
    }
    // Truncate if too long (overflow)
    if (binary.length > bits) {
      binary = binary.slice(binary.length - bits);
    }
    return binary;
  };

  // Calculate the Trace
  useEffect(() => {
    generateTrace();
    setStepIndex(0);
  }, [dividend, divisor, method, bitWidth]);

  const generateTrace = () => {
    if (divisor === 0) {
        setHistory([{ type: 'error', msg: 'Division durch 0 nicht möglich' }]);
        return;
    }

    const steps = [];
    const N = bitWidth;

    // Initial State mapping to Lecture Slides:
    // x = Remainder (initially 0, part of dividend logic in some hardware, but here accumulator)
    // y = Quotient (initially holds the Dividend)
    // z = Divisor
    // c = Carry Bit (implicit in our calc, but we visualize it)

    let regX = 0;        // x Register (Rest)
    let regY = dividend; // y Register (Quotient/Dividend)
    let regZ = divisor;  // z Register (Divisor)
    let regC = 0;        // c Bit

    steps.push({
      stepInfo: 'Start',
      x: regX, y: regY, z: regZ, c: regC,
      desc: 'Initialisierung. Dividend in y, Divisor in z, x = 0.',
      isRestore: false
    });

    if (method === 'restoring') {
      for (let i = 0; i < N; i++) {
        // 1. Shift Left (c | x | y)
        // c gets MSB of x
        // x gets shifted, LSB comes from MSB of y
        // y gets shifted, LSB becomes 0 (placeholder)

        const msbY = (regY >> (N - 1)) & 1;
        const msbX = (regX >> (N - 1)) & 1;

        regC = msbX; // New c is old MSB of x
        regX = ((regX << 1) | msbY) & (Math.pow(2, N) - 1);
        regY = (regY << 1) & (Math.pow(2, N) - 1);

        steps.push({
          stepInfo: `Zyklus ${i+1}: Shift`,
          x: regX, y: regY, z: regZ, c: regC,
          desc: `Shift c|x|y nach links.`,
          highlight: 'shift'
        });

        // 2. Subtract z from x (implied c|x - 0|z logic)
        const oldX = regX;
        const oldC = regC;

        // Combine c and x for the subtraction to handle the 33rd bit logic properly
        // Virtual value of c|x
        let valCX = (regC * Math.pow(2, N)) + regX;
        let diff = valCX - regZ;

        // Map back to c and x
        // If diff < 0, it means borrow.
        let newC = 0;
        let newX = 0;

        if (diff < 0) {
            // Borrow case (Result negative)
            // In 2's complement simulation or explicit borrow:
            newC = 1; // Notation in slides: c=1 means negative result/borrow needed
            // The x register would hold the result of subtraction.
            // (2^(N+1) + diff) gives the positive representation wrapped around
            newX = (Math.pow(2, N+1) + diff) & (Math.pow(2, N) - 1);
        } else {
            newC = 0; // Result positive
            newX = diff & (Math.pow(2, N) - 1);
        }

        regX = newX;
        regC = newC;

        steps.push({
          stepInfo: `Zyklus ${i+1}: Subtraktion`,
          x: regX, y: regY, z: regZ, c: regC,
          desc: `c|x = c|x - z. (Ergebnis ${diff < 0 ? 'negativ' : 'positiv'})`,
          highlight: 'sub'
        });

        // 3. Set y0 based on c (y0 = not c)
        const y0 = regC === 0 ? 1 : 0;

        // 4. Restore if needed
        if (regC === 1) {
          // Negative result -> y0 = 0
          steps.push({
            stepInfo: `Zyklus ${i+1}: Setze Bit`,
            x: regX, y: regY, z: regZ, c: regC,
            desc: `c=1 (negativ) -> Setze y0 = 0.`,
            qBit: 0,
            highlight: 'check-neg'
          });

          // Restore: x = x + z
          // We only restore x, c goes back to what it was?
          // Usually restore just adds z back to x.
          // Re-calculate valCX from current state (which is the subtraction result)
          // Actually, simply: x_new = x_old + z.
          // But wait, the previous x was lost. We add z to the current x.

          // To be precise with slide: "if c then c|x = c|x + 0|z"
          // We add z back to the coupled c|x
          let currentValCX = diff; // This was negative
          let restoredVal = currentValCX + regZ;

          // Map back
          // c should become oldC (usually 0 or 1 depending on overflow, but here likely 0 if it was a restore from a shift)
          // Simplification: Restore usually brings back the state BEFORE subtraction.
          // State before subtraction was: oldC, oldX.

          regX = oldX;
          regC = oldC;

          steps.push({
            stepInfo: `Zyklus ${i+1}: Restore`,
            x: regX, y: regY, z: regZ, c: regC,
            desc: `Restore durchgeführt (x auf alten Wert zurückgesetzt).`,
            highlight: 'restore'
          });
        } else {
          // Positive result -> y0 = 1
          regY = regY | 1; // Set LSB
          steps.push({
            stepInfo: `Zyklus ${i+1}: Setze Bit`,
            x: regX, y: regY, z: regZ, c: regC,
            desc: `c=0 (positiv) -> Setze y0 = 1. Kein Restore.`,
            qBit: 1,
            highlight: 'check-pos'
          });
        }
      }
    } else {
      // NON-RESTORING logic adaptation to x,y,z
      for (let i = 0; i < N; i++) {
        // Standard Non-Restoring often checks sign of x first
        const isXNegative = (regX & (1 << (N-1))) !== 0; // Check MSB of x (signed view)
        // Note: For strict correctness with unsigned inputs, we treat x as signed during the process

        // 1. Shift
        const msbY = (regY >> (N - 1)) & 1;
        regX = ((regX << 1) | msbY) & (Math.pow(2, N) - 1);
        regY = (regY << 1) & (Math.pow(2, N) - 1);

        steps.push({
          stepInfo: `Zyklus ${i+1}: Shift`,
          x: regX, y: regY, z: regZ, c: 0,
          desc: `Links-Shift x|y.`,
          highlight: 'shift'
        });

        // 2. Add/Sub based on sign
        // We use JS numbers to simulate the signed math
        let signedX = regX;
        // Convert to signed N-bit integer for calculation
        if ((regX & (1 << (N-1))) !== 0) {
            signedX = regX - Math.pow(2, N);
        }

        let opDesc = "";
        if (!isXNegative) {
            signedX = signedX - regZ;
            opDesc = "x positiv -> Subtrahiere z";
        } else {
            signedX = signedX + regZ;
            opDesc = "x negativ -> Addiere z";
        }

        // Convert back to unsigned N-bit rep for storage
        if (signedX < 0) {
            regX = (signedX + Math.pow(2, N)) & (Math.pow(2, N) - 1);
        } else {
            regX = signedX & (Math.pow(2, N) - 1);
        }

        steps.push({
            stepInfo: `Zyklus ${i+1}: Rechne`,
            x: regX, y: regY, z: regZ, c: 0,
            desc: `${opDesc}.`,
            highlight: 'calc'
        });

        // 3. Set y bit
        if (signedX >= 0) {
            regY = regY | 1;
            steps.push({
                stepInfo: `Zyklus ${i+1}: Setze Bit`,
                x: regX, y: regY, z: regZ, c: 0,
                desc: `x positiv -> Setze y0 = 1.`,
                qBit: 1,
                highlight: 'q-set'
            });
        } else {
            steps.push({
                stepInfo: `Zyklus ${i+1}: Setze Bit`,
                x: regX, y: regY, z: regZ, c: 0,
                desc: `x negativ -> Setze y0 = 0.`,
                qBit: 0,
                highlight: 'q-set'
            });
        }
      }

      // Final Correction Step for Non-Restoring
      // Check if remainder is negative (MSB set)
      if ((regX & (1 << (N-1))) !== 0) {
          regX = (regX + regZ) & (Math.pow(2, N) - 1);
          steps.push({
            stepInfo: `Korrektur`,
            x: regX, y: regY, z: regZ, c: 0,
            desc: `End-Rest negativ. Korrektur: x = x + z.`,
            highlight: 'correction-done'
        });
      }
    }

    // Final Result
    steps.push({
        stepInfo: 'Fertig',
        x: regX, y: regY, z: regZ, c: regC,
        desc: `Quotient (y): ${regY}, Rest (x): ${regX}`,
        highlight: 'finish'
    });

    setHistory(steps);
  };

  const current = history[stepIndex] || {};

  // Handle constraints
  const handleDivChange = (val) => {
      const v = parseInt(val) || 0;
      setDividend(Math.min(Math.max(0, v), 255)); // Max 8 bit input
  };

  const handleDivisorChange = (val) => {
      const v = parseInt(val) || 0;
      setDivisor(Math.min(Math.max(0, v), 255));
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-50 p-4 md:p-6 font-sans text-slate-800 rounded-xl overflow-hidden">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calculator className="w-6 h-6 text-blue-600" />
            Division Visualizer
          </h1>
          <p className="text-slate-500 text-sm">Notation nach Vorlesung (x, y, z, c)</p>
        </div>

        <div className="flex bg-slate-200 p-1 rounded-lg">
          <button
            onClick={() => setMethod('restoring')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              method === 'restoring'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Restoring
          </button>
          <button
            onClick={() => setMethod('non-restoring')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              method === 'non-restoring'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Non-Restoring
          </button>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Dividend (in y)</label>
          <input
            type="number"
            value={dividend}
            onChange={(e) => handleDivChange(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-400 uppercase">Divisor (z)</label>
          <input
            type="number"
            value={divisor}
            onChange={(e) => handleDivisorChange(e.target.value)}
            className="border border-slate-300 rounded px-3 py-2 font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-slate-400 uppercase">Bit-Breite</label>
            <select
                value={bitWidth}
                onChange={(e) => setBitWidth(parseInt(e.target.value))}
                className="border border-slate-300 rounded px-3 py-2 font-mono text-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
            >
                <option value={4}>4 Bit (Tutorial)</option>
                <option value={5}>5 Bit</option>
                <option value={6}>6 Bit</option>
                <option value={8}>8 Bit (Standard)</option>
            </select>
        </div>
        <div className="flex items-end gap-2">
            <button
                onClick={() => setStepIndex(0)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded border border-slate-300 transition-colors flex items-center justify-center"
                title="Reset"
            >
                <RotateCcw size={18} />
            </button>
            <button
                onClick={() => setStepIndex(prev => Math.max(0, prev - 1))}
                disabled={stepIndex <= 0}
                className="flex-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold py-2 px-3 rounded border border-slate-300 transition-colors flex items-center justify-center gap-1"
            >
                <ChevronLeft size={18} /> Zurück
            </button>
            <button
                onClick={() => setStepIndex(prev => Math.min(prev + 1, history.length - 1))}
                disabled={stepIndex >= history.length - 1}
                className="flex-[2] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-2 px-3 rounded shadow-md transition-colors flex items-center justify-center gap-1"
            >
                {stepIndex >= history.length - 1 ? 'Ende' : 'Weiter'} <ChevronRight size={18} />
            </button>
        </div>
      </div>

      {/* VISUALIZATION */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-0">

        {/* LEFT: Registers Visual */}
        <div className="bg-slate-900 rounded-xl p-6 text-white shadow-lg flex flex-col justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

            {/* Step Indicator */}
            <div className="absolute top-4 right-4 text-xs font-mono text-slate-400 border border-slate-700 px-2 py-1 rounded">
                Schritt {stepIndex} / {history.length - 1}
            </div>

            {current.stepInfo && (
                <div className="mb-8 text-center">
                    <h2 className="text-2xl font-bold text-blue-400 mb-1">{current.stepInfo}</h2>
                    <p className="text-slate-300 h-12 flex items-center justify-center px-4">{current.desc}</p>
                </div>
            )}

            {/* Registers */}
            <div className="space-y-6 max-w-md mx-auto w-full">

                {/* COMBINED REGISTER C|X|Y */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                    <label className="text-xs text-slate-400 font-bold uppercase mb-2 block tracking-wider text-center">
                        Arbeits-Register (c | x | y)
                    </label>
                    <div className="flex gap-2 items-center justify-center font-mono text-3xl">

                         {/* c Bit */}
                         <div className="flex flex-col items-center">
                            <span className={`px-2 rounded ${current.c === 1 ? 'bg-red-500/20 text-red-400' : 'text-slate-500'}`}>
                                {current.c !== undefined ? current.c : 0}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 border-t border-slate-600 pt-1 w-full text-center">c</span>
                        </div>
                        <span className="text-slate-600">|</span>

                        {/* x Register */}
                        <div className="flex flex-col items-center">
                            <span className={`transition-colors duration-300 ${current.x < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                                {toBin(current.x, bitWidth)}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 border-t border-slate-600 pt-1 w-full text-center">Rest (x)</span>
                        </div>
                        <span className="text-slate-600">|</span>

                        {/* y Register */}
                        <div className="flex flex-col items-center">
                             <span className="text-blue-300">
                                {toBin(current.y, bitWidth)}
                            </span>
                            <span className="text-xs text-slate-500 mt-1 border-t border-slate-600 pt-1 w-full text-center">Quot (y)</span>
                        </div>
                    </div>
                </div>

                {/* DIVISOR Z */}
                <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                    <div>
                        <label className="text-xs text-slate-400 font-bold uppercase block tracking-wider">
                            Divisor (z)
                        </label>
                        <span className="font-mono text-lg text-slate-400">({current.z})</span>
                    </div>
                    <div className="font-mono text-2xl text-purple-300">
                        {toBin(current.z, bitWidth)}
                    </div>
                </div>

                {/* DECIMAL CHECK */}
                <div className="mt-8 p-3 bg-blue-900/20 rounded border border-blue-900/50 text-center">
                    <span className="text-sm text-blue-300">
                       Dezimal: x={current.x}  y={current.y}
                    </span>
                    {stepIndex === history.length - 1 && (
                        <div className="text-xs text-slate-400 mt-1">
                            {dividend} / {divisor} = {Math.floor(dividend/divisor)} Rest {dividend%divisor}
                        </div>
                    )}
                </div>

            </div>
        </div>

        {/* RIGHT: History Log */}
        <div className="bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-slate-700 flex items-center gap-2">
                <BookOpen size={18} />
                Verlauf
            </div>
            <div className="flex-1 overflow-y-auto p-0">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0">
                        <tr>
                            <th className="px-3 py-2">Info</th>
                            <th className="px-2 py-2 text-center w-8">c</th>
                            <th className="px-2 py-2 font-mono">x</th>
                            <th className="px-2 py-2 font-mono">y</th>
                            <th className="px-3 py-2">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {history.map((step, idx) => (
                            <tr
                                key={idx}
                                className={`border-b border-slate-100 transition-colors cursor-pointer ${
                                    idx === stepIndex
                                        ? 'bg-blue-50'
                                        : 'hover:bg-slate-50'
                                }`}
                                onClick={() => setStepIndex(idx)}
                            >
                                <td className="px-3 py-3 font-medium text-slate-600 whitespace-nowrap">
                                    {step.stepInfo.split(':')[0]}
                                </td>
                                <td className={`px-2 py-3 text-center font-bold ${step.c ? 'text-red-500' : 'text-slate-300'}`}>
                                    {step.c}
                                </td>
                                <td className={`px-2 py-3 font-mono ${step.x < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                    {toBin(step.x, bitWidth)}
                                </td>
                                <td className="px-2 py-3 font-mono text-blue-600">
                                    {toBin(step.y, bitWidth)}
                                </td>
                                <td className="px-3 py-3 text-slate-500 text-xs truncate max-w-[120px]" title={step.desc}>
                                    {step.desc}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Auto scroll helper */}
                <div ref={(el) => {
                    if (el && stepIndex === history.length - 1) {
                         el.scrollIntoView({ behavior: 'smooth' });
                    }
                }} />
            </div>
        </div>
      </div>
    </div>
  );
};

export default BinaryDivision;
