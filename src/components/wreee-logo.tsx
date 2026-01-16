/**
 * "wreee" ロゴ — freee スタイル
 * Pacifico（筆記体）+ freee ブルー #3b6de8
 */
export function WreeeLogoSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 136 40"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="wreee"
      className={className}
      fill="none"
    >
      <text
        x="2"
        y="32"
        fontFamily="'Pacifico', cursive"
        fontWeight="400"
        fontSize="30"
        fill="#3b6de8"
      >
        wreee
      </text>
    </svg>
  );
}
