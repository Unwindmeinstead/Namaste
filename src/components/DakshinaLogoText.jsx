// Dakshina Logo - Text with integrated Kalasha (matching provided design)
export const DakshinaLogoText = ({ className }) => (
  <svg className={className} viewBox="0 0 240 70" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <style>{`
        .logo-devanagari {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 38px;
          font-weight: 700;
        }
        .logo-latin {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
          font-size: 30px;
          font-weight: 300;
          font-style: italic;
          letter-spacing: 0.02em;
        }
      `}</style>
    </defs>
    
    {/* Devanagari "द" - bold sans-serif */}
    <text x="2" y="48" className="logo-devanagari" fill="currentColor">द</text>
    
    {/* Latin "aksh" - connected flowing style */}
    <text x="42" y="48" className="logo-latin" fill="currentColor">aksh</text>
    
    {/* Kalasha replacing the dot of 'i' - detailed design */}
    <g transform="translate(125, 10)">
      {/* Pot body with decorative patterns */}
      <ellipse cx="10" cy="22" rx="7" ry="6" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Decorative band - small circles */}
      <circle cx="6" cy="22" r="1" fill="currentColor"/>
      <circle cx="8" cy="22" r="1" fill="currentColor"/>
      <circle cx="10" cy="22" r="1" fill="currentColor"/>
      <circle cx="12" cy="22" r="1" fill="currentColor"/>
      <circle cx="14" cy="22" r="1" fill="currentColor"/>
      {/* Diamond pattern on pot */}
      <path d="M7 19 L10 16 L13 19 L10 22 Z" stroke="currentColor" strokeWidth="0.8" fill="none"/>
      {/* Pot neck */}
      <path d="M6 16 L6 13 Q6 11, 10 10 Q14 11, 14 13 L14 16" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Bead strings hanging from sides */}
      <circle cx="4" cy="18" r="1.2" fill="currentColor"/>
      <circle cx="4" cy="20" r="1.2" fill="currentColor"/>
      <circle cx="16" cy="18" r="1.2" fill="currentColor"/>
      <circle cx="16" cy="20" r="1.2" fill="currentColor"/>
      {/* Mango leaves - 5 leaves arranged circularly, central largest */}
      <path d="M10 10 Q5 7, 2 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d="M10 10 Q7 6, 5 2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M10 10 Q10 5, 10 0" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M10 10 Q13 6, 15 2" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
      <path d="M10 10 Q15 7, 18 3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Coconut on top */}
      <ellipse cx="10" cy="-1" rx="3.5" ry="3" stroke="currentColor" strokeWidth="2" fill="none"/>
      {/* Three upward flames/energy lines from coconut */}
      <path d="M10 -4 Q9 -6, 10 -7.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M10 -4 Q10 -6.5, 10 -8" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      <path d="M10 -4 Q11 -6, 10 -7.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
    </g>
    
    {/* Continue "na" after Kalasha */}
    <text x="150" y="48" className="logo-latin" fill="currentColor">na</text>
    
    {/* Upper decorative swoosh - thinner curved line */}
    <path d="M0 18 Q60 12, 120 14 Q180 16, 240 18" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    
    {/* Lower decorative swoosh - thicker curved line */}
    <path d="M0 58 Q60 60, 120 58 Q180 56, 240 58" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
  </svg>
)

