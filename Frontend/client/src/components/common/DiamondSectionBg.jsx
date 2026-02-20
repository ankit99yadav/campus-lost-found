/**
 * DiamondSectionBg — drop inside any `relative overflow-hidden` section.
 * Uses absolute positioning so it only fills that section.
 * Pass `dark={true}` for dark sections (footer) to use lighter colors.
 */
const DiamondSectionBg = ({ dark = false }) => {
  const indigo = dark ? 'rgba(165,180,252,' : 'rgba(99,102,241,';
  const orange = dark ? 'rgba(253,186,116,' : 'rgba(251,146,60,';

  return (
    <div className="diamond-section-bg" aria-hidden="true">
      {/* Grid overlay */}
      <div className="dsb-grid" />

      {/* Pulsing diamonds */}
      <div className="dsb-pulse" style={{ '--dsb-color': `${indigo}0.18)`, '--size': '38px', '--delay': '0s',   left: '5%',  top: '20%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${orange}0.18)`, '--size': '28px', '--delay': '1s',   left: '15%', top: '65%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${indigo}0.15)`, '--size': '44px', '--delay': '0.5s', left: '30%', top: '10%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${orange}0.16)`, '--size': '32px', '--delay': '2s',   left: '48%', top: '75%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${indigo}0.18)`, '--size': '36px', '--delay': '1.5s', left: '65%', top: '15%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${orange}0.15)`, '--size': '24px', '--delay': '0.8s', left: '75%', top: '60%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${indigo}0.14)`, '--size': '42px', '--delay': '2.5s', left: '88%', top: '25%' }} />
      <div className="dsb-pulse" style={{ '--dsb-color': `${orange}0.17)`, '--size': '30px', '--delay': '3s',   left: '93%', top: '70%' }} />

      {/* Sparkle dots */}
      <div className="dsb-sparkle" style={{ '--dsb-color': `${indigo}0.55)`, '--delay': '0s',   left: '10%', top: '50%' }} />
      <div className="dsb-sparkle" style={{ '--dsb-color': `${orange}0.6)`,  '--delay': '0.6s', left: '25%', top: '30%' }} />
      <div className="dsb-sparkle" style={{ '--dsb-color': `${indigo}0.55)`, '--delay': '1.2s', left: '42%', top: '80%' }} />
      <div className="dsb-sparkle" style={{ '--dsb-color': `${orange}0.6)`,  '--delay': '1.8s', left: '60%', top: '40%' }} />
      <div className="dsb-sparkle" style={{ '--dsb-color': `${indigo}0.5)`,  '--delay': '2.4s', left: '80%', top: '70%' }} />
      <div className="dsb-sparkle" style={{ '--dsb-color': `${orange}0.55)`, '--delay': '0.9s', left: '95%', top: '45%' }} />
    </div>
  );
};

export default DiamondSectionBg;
