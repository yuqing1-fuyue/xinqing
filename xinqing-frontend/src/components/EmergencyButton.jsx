import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import styles from './EmergencyButton.module.css';

export default function EmergencyButton() {
  const [hover, setHover] = useState(false);

  return (
    <Link
      to="/emergency"
      className={styles.btn}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="紧急心理援助"
    >
      <Phone size={20} className={styles.icon} />
      <span className={`${styles.label} ${hover ? styles.labelVisible : ''}`}>紧急求助</span>
      <span className={styles.pulse} />
    </Link>
  );
}
