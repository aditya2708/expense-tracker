export type User = {
  id: number;
  name: string;
  email: string;
};

export type Category = {
  id: number;
  name: string;
};

export type Expense = {
  id: number;
  amount: number;
  occurred_on: string;
  note: string | null;
  category: Category;
};

export type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
};

export type PaginationLinks = {
  first: string | null;
  last: string | null;
  prev: string | null;
  next: string | null;
};

export type Paginated<T> = {
  data: T[];
  links: PaginationLinks;
  meta: PaginationMeta;
};

export type ReportCategory = {
  id: number;
  name: string;
  total: number;
  count: number;
  share: number;
};

export type MonthlyReport = {
  month: string;
  total: number;
  expense_count: number;
  categories: ReportCategory[];
  previous_month: {
    month: string;
    total: number;
  };
  change_percentage: number | null;
};

export type CategoryPayload = {
  name: string;
};

export type ExpensePayload = {
  category_id: number;
  amount: number;
  occurred_on: string;
  note?: string | null;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = LoginPayload & {
  name: string;
  password_confirmation: string;
};
