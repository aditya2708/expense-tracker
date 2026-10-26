const rupiahFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const monthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "long",
  year: "numeric",
});

const decimalFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 2,
  signDisplay: "exceptZero",
});

export function formatRupiah(amount: number): string {
  return rupiahFormatter.format(amount);
}

export function formatDate(value: string): string {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function formatMonth(value: string): string {
  return monthFormatter.format(new Date(`${value}-01T00:00:00`));
}

export function formatShare(value: number): string {
  return `${decimalFormatter.format(value)}%`;
}

export function formatChange(value: number): string {
  return `${percentFormatter.format(value)}%`;
}

export function todayInJakarta(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}
