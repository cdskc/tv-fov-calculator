import React, { useState, useMemo } from 'react';

export default function TVFOVCalculator() {
  const [distance, setDistance] = useState(8);
  const [diagonal, setDiagonal] = useState(65);
  const [unit, setUnit] = useState('feet');

  const calculation = useMemo(() => {
    const aspectW = 16;
    const aspectH = 9;
    const aspectDiag = Math.sqrt(aspectW ** 2 + aspectH ** 2);
    
    // Screen dimensions in inches
    const widthInches = (diagonal * aspectW) / aspectDiag;
    const heightInches = (diagonal * aspectH) / aspectDiag;
    
    // Convert distance to inches for calculation
    const distanceInches = unit === 'feet' ? distance * 12 : distance * 2.54;
    
    // Calculate FOV (horizontal)
    const fovRadians = 2 * Math.atan(widthInches / (2 * distanceInches));
    const fovDegrees = fovRadians * (180 / Math.PI);
    
    // Vertical FOV
    const vFovRadians = 2 * Math.atan(heightInches / (2 * distanceInches));
    const vFovDegrees = vFovRadians * (180 / Math.PI);
    
    // THX recommends 40° FOV, SMPTE recommends 30° for movies
    // Ideal viewing distance for 40° FOV
    const idealDistanceInches = widthInches / (2 * Math.tan((40 * Math.PI / 180) / 2));
    const idealDistanceFeet = idealDistanceInches / 12;
    const idealDistanceCm = idealDistanceInches * 2.54;
    
    return {
      fov: fovDegrees,
      vFov: vFovDegrees,
      widthInches,
      heightInches,
      idealDistance: unit === 'feet' ? idealDistanceFeet : idealDistanceCm,
    };
  }, [distance, diagonal, unit]);

  const getFOVRating = (fov) => {
    if (fov >= 36 && fov <= 44) return { label: 'Ideal (THX)', color: '#22c55e' };
    if (fov >= 28 && fov <= 36) return { label: 'Good (SMPTE)', color: '#84cc16' };
    if (fov >= 44 && fov <= 55) return { label: 'Immersive', color: '#eab308' };
    if (fov < 28) return { label: 'Too Far', color: '#f97316' };
    return { label: 'Very Close', color: '#ef4444' };
  };

  const rating = getFOVRating(calculation.fov);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-2">TV Field of View Calculator</h1>
        <p className="text-slate-400 text-center mb-8">Find the optimal viewing experience for your setup</p>
        
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Viewing Distance ({unit === 'feet' ? 'ft' : 'cm'})
              </label>
              <input
                type="range"
                min={unit === 'feet' ? 3 : 75}
                max={unit === 'feet' ? 20 : 600}
                step={unit === 'feet' ? 0.5 : 10}
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <input
                type="number"
                value={distance}
                onChange={(e) => setDistance(parseFloat(e.target.value) || 0)}
                className="mt-2 w-full bg-slate-700 rounded-lg px-3 py-2 text-center text-xl font-semibold"
              />
            </div>
            
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Screen Diagonal (inches)
              </label>
              <input
                type="range"
                min="32"
                max="100"
                value={diagonal}
                onChange={(e) => setDiagonal(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <input
                type="number"
                value={diagonal}
                onChange={(e) => setDiagonal(parseInt(e.target.value) || 0)}
                className="mt-2 w-full bg-slate-700 rounded-lg px-3 py-2 text-center text-xl font-semibold"
              />
            </div>
          </div>
          
          <div className="flex justify-center gap-2 mb-4">
            <button
              onClick={() => {
                if (unit === 'cm') setDistance(Math.round(distance / 30.48 * 2) / 2);
                setUnit('feet');
              }}
              className={`px-4 py-2 rounded-lg transition ${unit === 'feet' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Feet
            </button>
            <button
              onClick={() => {
                if (unit === 'feet') setDistance(Math.round(distance * 30.48 / 10) * 10);
                setUnit('cm');
              }}
              className={`px-4 py-2 rounded-lg transition ${unit === 'cm' ? 'bg-blue-600' : 'bg-slate-700 hover:bg-slate-600'}`}
            >
              Centimeters
            </button>
          </div>
        </div>

        {/* FOV Display */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6 text-center">
          <div className="text-slate-400 mb-1">Horizontal Field of View</div>
          <div className="text-6xl font-bold mb-2" style={{ color: rating.color }}>
            {calculation.fov.toFixed(1)}°
          </div>
          <div 
            className="inline-block px-4 py-1 rounded-full text-sm font-semibold"
            style={{ backgroundColor: rating.color + '20', color: rating.color }}
          >
            {rating.label}
          </div>
          
          <div className="mt-4 text-slate-400 text-sm">
            Vertical FOV: {calculation.vFov.toFixed(1)}°
          </div>
        </div>

        {/* Visual representation */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <svg viewBox="0 0 400 200" className="w-full">
            {/* FOV cone */}
            <defs>
              <linearGradient id="coneGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={rating.color} stopOpacity="0.3" />
                <stop offset="100%" stopColor={rating.color} stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Draw FOV cone */}
            {(() => {
              const fovRad = (calculation.fov * Math.PI) / 180;
              const coneLength = 180;
              const halfAngle = fovRad / 2;
              const endY1 = 100 - Math.sin(halfAngle) * coneLength;
              const endY2 = 100 + Math.sin(halfAngle) * coneLength;
              const endX = 20 + Math.cos(halfAngle) * coneLength;
              
              return (
                <path
                  d={`M 20 100 L ${endX} ${endY1} L ${endX} ${endY2} Z`}
                  fill="url(#coneGradient)"
                  stroke={rating.color}
                  strokeWidth="2"
                  strokeOpacity="0.5"
                />
              );
            })()}
            
            {/* Viewer */}
            <circle cx="20" cy="100" r="8" fill="#3b82f6" />
            <circle cx="17" cy="98" r="2" fill="#1e40af" />
            <circle cx="23" cy="98" r="2" fill="#1e40af" />
            
            {/* TV */}
            <rect x="360" y="50" width="8" height="100" rx="2" fill="#64748b" />
            <rect x="362" y="52" width="4" height="96" fill="#1e293b" />
            
            {/* Labels */}
            <text x="200" y="185" textAnchor="middle" fill="#94a3b8" fontSize="12">
              {distance} {unit === 'feet' ? 'ft' : 'cm'} viewing distance
            </text>
          </svg>
        </div>

        {/* Reference guide */}
        <div className="bg-slate-800 rounded-2xl p-6">
          <h3 className="font-semibold mb-4">FOV Reference Guide</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-slate-400">36°–44°</span>
              <span>THX Recommended (cinematic)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-lime-500"></div>
              <span className="text-slate-400">28°–36°</span>
              <span>SMPTE Standard (comfortable)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-slate-400">44°–55°</span>
              <span>Immersive (gaming, sports)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-slate-400">&lt;28°</span>
              <span>Too far – consider moving closer</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-slate-400">&gt;55°</span>
              <span>Very close – may cause eye strain</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-slate-700/50 rounded-xl">
            <div className="text-slate-400 text-sm">For THX-recommended 40° FOV with your {diagonal}" TV:</div>
            <div className="text-lg font-semibold mt-1">
              Ideal distance: {calculation.idealDistance.toFixed(1)} {unit === 'feet' ? 'ft' : 'cm'}
            </div>
          </div>
        </div>
        
        <p className="text-center text-slate-500 text-sm mt-6">
          Screen dimensions: {calculation.widthInches.toFixed(1)}" × {calculation.heightInches.toFixed(1)}" (16:9)
        </p>
      </div>
    </div>
  );
}
