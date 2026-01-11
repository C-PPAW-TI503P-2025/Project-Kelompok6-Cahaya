import './SensorCard.css';

const SensorCard = ({ title, value, unit, icon, level, color }) => {
    return (
        <div className="sensor-card" style={{ borderLeftColor: color }}>
            <div className="sensor-header">
                <span className="sensor-icon">{icon}</span>
                <h3>{title}</h3>
            </div>

            <div className="sensor-value">
                <span className="value">{typeof value === 'number' ? value.toFixed(2) : value}</span>
                <span className="unit">{unit}</span>
            </div>

            {level && (
                <div className="sensor-level" style={{ color }}>
                    {level}
                </div>
            )}
        </div>
    );
};

export default SensorCard;
