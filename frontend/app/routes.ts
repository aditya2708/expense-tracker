import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/auth-layout.tsx", [
    route("login", "routes/login.tsx"),
    route("register", "routes/register.tsx"),
  ]),
  layout("routes/app-layout.tsx", [
    index("routes/dashboard.tsx"),
    route("expenses", "routes/expenses.tsx"),
    route("expenses/new", "routes/expense-new.tsx"),
    route("expenses/:expenseId/edit", "routes/expense-edit.tsx"),
    route("categories", "routes/categories.tsx"),
    route("reports", "routes/reports.tsx"),
  ]),
  route("logout", "routes/logout.ts"),
] satisfies RouteConfig;
