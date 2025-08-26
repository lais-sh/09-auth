import styles from "./loading.module.css";

type SpinnerProps = {
  size?: number | string;
  label?: string;
  showText?: boolean;
  className?: string;
  ariaLabel?: string;
  "data-testid"?: string;
};

export default function Spinner({
  size = 40,
  label = "Loading…",
  showText = true,
  className,
  ariaLabel,
  "data-testid": dataTestId,
}: SpinnerProps) {
  const dimension = typeof size === "number" ? `${size}px` : size;
  const wrapperClass = className ? `${styles.wrapper} ${className}` : styles.wrapper;

  return (
    <div
      className={wrapperClass}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel ?? label}
      data-testid={dataTestId}
    >
      <svg
        className={styles.spinner}
        viewBox="0 0 50 50"
        width={dimension}
        height={dimension}
        aria-hidden="true"
        focusable="false"
      >
        <circle
          className={styles.path}
          cx="25"
          cy="25"
          r="20"
          fill="none"
          strokeWidth="4"
        />
      </svg>

      {showText && <span className={styles.text}>{label}</span>}
    </div>
  );
}
