// components/Spinner.js — indicador de carga reutilizable

// size="md" → spinner grande (carga de página)
// size="sm" → spinner pequeño (dentro de botones)

const Spinner = ({ size = 'md' }) => (
  <div className={`spinner${size === 'sm' ? ' spinner--sm' : ''}`} />
);

export default Spinner;
