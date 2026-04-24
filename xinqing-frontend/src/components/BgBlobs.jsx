import styles from './BgBlobs.module.css';

export default function BgBlobs() {
  return (
    <div className={styles.container}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.blob4} />
    </div>
  );
}
