import React, { useState, useCallback } from 'react';
import { questions } from '../data/questions';
import './QuestionRoulette.css';
import inyeccionImage from '../assets/inyeccion2.png';

const RADIUS = 180;
const CENTER = 200;
const NUMBERS = Array.from({ length: 30 }, (_, i) => i + 1);
const SEGMENT_COLORS = [
  '#DB3E4D', '#3058A6', '#28a745', '#ffc107', '#17a2b8', '#6f42c1',
  '#fd7e14', '#e83e8c', '#20c997', '#6c757d', '#007bff', '#dc3545',
  '#28a745', '#ffc107', '#17a2b8', '#6f42c1', '#fd7e14', '#e83e8c',
  '#20c997', '#6c757d', '#007bff', '#dc3545', '#28a745', '#ffc107',
  '#17a2b8', '#6f42c1', '#fd7e14', '#e83e8c', '#20c997', '#6c757d'
];

const QuestionRoulette: React.FC = () => {
  const [angle, setAngle] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  const anglePerSlice = 360 / NUMBERS.length;

  const spinRoulette = useCallback(() => {
      if (spinning) return;
      setSpinning(true);
      
      // Entre 2 y 4 vueltas aleatorias para más variabilidad
      const minSpins = 2;
      const maxSpins = 4;
      const totalSpins = minSpins + Math.random() * (maxSpins - minSpins);
      const randomSegment = Math.floor(Math.random() * NUMBERS.length);
      const segmentAngle = randomSegment * anglePerSlice + (anglePerSlice / 2);
      
      // Nueva posición: ángulo actual + vueltas aleatorias + ángulo del segmento
      const newAngle = angle + (360 * totalSpins) + segmentAngle;
      setAngle(newAngle);
      
      // Usar requestAnimationFrame para mejor sincronización
      const timeout = setTimeout(() => {
          requestAnimationFrame(() => {
              const normalized = ((newAngle % 360) + 360) % 360;
              let index = Math.floor((360 - normalized) / anglePerSlice) % NUMBERS.length;
              if (index < 0) index += NUMBERS.length;
              setSelected(index);
              setSpinning(false);
          });
      }, 4000);

      return () => clearTimeout(timeout);
  }, [spinning, angle, anglePerSlice]);

  // Optimización: usar una transición más suave para móviles
  const getTransitionStyle = () => {
    if (!spinning) return 'none';
    
    // Detectar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Transición optimizada para móviles
      return 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    } else {
      // Transición normal para desktop
      return 'transform 4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
  };

  return (
      <div className="roulette-container">
          <div className="roulette-wrapper">
              <svg
                  viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
                  className={spinning ? 'roulette-spinning' : ''}
                  style={{
                      transform: `rotate(${angle}deg)`,
                      transition: getTransitionStyle(),
                  }}
              >
                  <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000" floodOpacity="0.2"/>
                      </filter>
                  </defs>
                  {/* Segmentos de colores */}
                  {NUMBERS.map((num, i) => {
                      const startAngle = (i * anglePerSlice - 90) * Math.PI / 180;
                      const endAngle = ((i + 1) * anglePerSlice - 90) * Math.PI / 180;
                      const x1 = CENTER + RADIUS * Math.cos(startAngle);
                      const y1 = CENTER + RADIUS * Math.sin(startAngle);
                      const x2 = CENTER + RADIUS * Math.cos(endAngle);
                      const y2 = CENTER + RADIUS * Math.sin(endAngle);
                      const largeArcFlag = anglePerSlice > 180 ? 1 : 0;
                      const pathData = [
                          `M ${CENTER} ${CENTER}`,
                          `L ${x1} ${y1}`,
                          `A ${RADIUS} ${RADIUS} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                          'Z'
                      ].join(' ');
                      return (
                          <path
                              key={`segment-${i}`}
                              d={pathData}
                              fill={SEGMENT_COLORS[i % SEGMENT_COLORS.length]}
                              stroke="#FFFFFF"
                              strokeWidth="2"
                              filter="url(#shadow)"
                          />
                      );
                  })}
                  {/* Círculo interior blanco */}
                  <circle 
                      cx={CENTER} 
                      cy={CENTER} 
                      r={55} 
                      fill="#FFFFFF"
                      stroke="#3058A6"
                      strokeWidth="4"
                      filter="url(#shadow)"
                  />
                  {/* Números en cada segmento */}
                  {NUMBERS.map((num, i) => {
                      const angle = (i * anglePerSlice + anglePerSlice / 2 - 90) * Math.PI / 180;
                      const textRadius = RADIUS * 0.82;
                      const x = CENTER + textRadius * Math.cos(angle);
                      const y = CENTER + textRadius * Math.sin(angle);
                      return (
                          <text
                              key={i}
                              x={x}
                              y={y}
                              textAnchor="middle"
                              alignmentBaseline="middle"
                              fontSize="22"
                              fill="#FFFFFF"
                              fontWeight="bold"
                              style={{
                                  filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
                                  letterSpacing: '0.3px',
                                  userSelect: 'none',
                              }}
                          >
                              {num}
                          </text>
                      );
                  })}
                  {/* Imagen médica en el centro */}
                  <image 
                      x={CENTER - 45} 
                      y={CENTER - 45} 
                      width="90" 
                      height="90" 
                      href={inyeccionImage}
                      style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
                      }}
                  />
              </svg>
              <div className="roulette-pointer">▼</div>
          </div>
          <button className="spin-btn" onClick={spinRoulette} disabled={spinning}>
              {spinning ? 'Girando...' : 'Girar Ruleta'}
          </button>
          {selected !== null && (
              <div className="selected-question">
                  <h2><span>Pregunta {NUMBERS[selected]}:</span> {questions[selected]}</h2>
              </div>
          )}
      </div>
  );
};

export default QuestionRoulette;