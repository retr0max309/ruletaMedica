import React, { useState, useCallback, useEffect, useRef } from 'react';
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
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const anglePerSlice = 360 / NUMBERS.length;

  // Detectar dispositivo móvil al montar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const touch = 'ontouchstart' in window;
      const smallScreen = window.innerWidth <= 768;
      setIsMobile(mobile || (touch && smallScreen));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Preparar GPU acceleration al montar
  useEffect(() => {
    if (svgRef.current && wrapperRef.current) {
      // Forzar creación de capa compuesta
      svgRef.current.style.transform = 'translateZ(0) rotate(0deg)';
      wrapperRef.current.style.transform = 'translateZ(0)';
    }
  }, []);

  const spinRoulette = useCallback(() => {
      if (spinning) return;
      
      setSpinning(true);
      
      // Optimización: pre-calcular valores
      const minSpins = 2;
      const maxSpins = 4;
      const totalSpins = minSpins + Math.random() * (maxSpins - minSpins);
      const randomSegment = Math.floor(Math.random() * NUMBERS.length);
      const segmentAngle = randomSegment * anglePerSlice + (anglePerSlice / 2);
      const newAngle = angle + (360 * totalSpins) + segmentAngle;
      
      // Aplicar transformación inmediatamente con RAF
      requestAnimationFrame(() => {
        if (svgRef.current) {
          // Usar transform3d para mejor aceleración de hardware
          svgRef.current.style.transform = `translate3d(0, 0, 0) rotate(${newAngle}deg)`;
        }
        setAngle(newAngle);
      });
      
      // Calcular resultado después de la animación
      const timeout = setTimeout(() => {
          requestAnimationFrame(() => {
              const normalized = ((newAngle % 360) + 360) % 360;
              let index = Math.floor((360 - normalized) / anglePerSlice) % NUMBERS.length;
              if (index < 0) index += NUMBERS.length;
              setSelected(index);
              setSpinning(false);
          });
      }, isMobile ? 3800 : 4000); // Ligeramente más corto en móviles

      return () => clearTimeout(timeout);
  }, [spinning, angle, anglePerSlice, isMobile]);

  // Función para obtener la duración de transición optimizada
  const getTransitionDuration = () => {
    return isMobile ? '3.8s' : '4s';
  };

  // Función para obtener la curva de transición optimizada
  const getTransitionTiming = () => {
    return isMobile 
      ? 'cubic-bezier(0.25, 0.1, 0.25, 1)' // Más lineal para móviles
      : 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
  };

  return (
      <div className="roulette-container">
          <div 
            className="roulette-wrapper"
            ref={wrapperRef}
          >
              <svg
                  ref={svgRef}
                  viewBox={`0 0 ${CENTER * 2} ${CENTER * 2}`}
                  className={`roulette-svg ${spinning ? 'roulette-spinning' : ''} ${isMobile ? 'mobile-optimized' : ''}`}
                  style={{
                      transform: `translate3d(0, 0, 0) rotate(${angle}deg)`,
                      transition: spinning 
                        ? `transform ${getTransitionDuration()} ${getTransitionTiming()}`
                        : 'none',
                      // Optimizaciones adicionales para móviles
                      ...(isMobile && {
                        transformStyle: 'preserve-3d',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        willChange: spinning ? 'transform' : 'auto',
                      })
                  }}
              >
                  <defs>
                      <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                          <feDropShadow 
                            dx="0" 
                            dy={isMobile ? "1" : "2"} 
                            stdDeviation={isMobile ? "2" : "3"} 
                            floodColor="#000" 
                            floodOpacity={isMobile ? "0.15" : "0.2"}
                          />
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
                              strokeWidth={isMobile ? "1.5" : "2"}
                              filter={isMobile ? undefined : "url(#shadow)"}
                              style={{
                                vectorEffect: 'non-scaling-stroke'
                              }}
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
                      strokeWidth={isMobile ? "3" : "4"}
                      filter={isMobile ? undefined : "url(#shadow)"}
                      style={{
                        vectorEffect: 'non-scaling-stroke'
                      }}
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
                              fontSize={isMobile ? "20" : "22"}
                              fill="#FFFFFF"
                              fontWeight="bold"
                              style={{
                                  filter: isMobile 
                                    ? undefined 
                                    : 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))',
                                  letterSpacing: '0.3px',
                                  userSelect: 'none',
                                  textShadow: isMobile 
                                    ? '0 1px 2px rgba(0,0,0,0.8)' 
                                    : undefined,
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
                          filter: isMobile 
                            ? undefined 
                            : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
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