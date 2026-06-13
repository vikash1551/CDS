export function CustomLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <g transform="translate(-4, 0)">
        {/* Circle outline with gap on the left */}
        <path 
          d="M38 68 C34 62 33 55 35 48 C37 38 43 30 52 26 C66 19 82 25 89 39 C96 52 90 69 77 76 C65 82 50 79 41 68" 
          stroke="currentColor" 
          strokeWidth="6" 
          strokeLinecap="round" 
        />
        
        {/* Speed lines */}
        <path d="M25 45 H43" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M15 55 H36" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        <path d="M25 65 H42" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
        
        {/* Lightning Bolt */}
        <path 
          d="M62 25 L42 52 H58 L52 75 L73 48 H57 L62 25 Z" 
          fill="currentColor" 
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
