export const formatJarakTanam = (val: number | undefined | null): string => {
  if (!val) return '-';
  if (val === 20) return '15 × 20 cm';
  if (val === 40) return '40 × 60 cm';
  if (val === 75) return '20 × 75 cm';
  return `${val} cm`;
};
