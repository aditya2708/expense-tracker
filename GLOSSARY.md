# Expense Tracker

Language for the personal expense tracking context. Code identifiers and API fields are English; the UI is Indonesian.

## Language

**User**:
A person with an account and the owner of every category and expense created under it.
_Avoid_: account, member, tenant, customer

**Expense**:
A single outgoing amount recorded by a user on a date, assigned to exactly one category. Its `occurred_on` is when the money was spent, not when it was entered.
_Avoid_: transaction, spending, purchase, entry

**Amount**:
A positive integer in rupiah (IDR) with no decimal part, stored as cents-free integer units.
_Avoid_: price, value, total

**Category**:
A user-owned label that groups expenses. Every user starts with six defaults; a category can be renamed or deleted only while no expense uses it.
_Avoid_: tag, type, group

**Monthly report**:
A derived summary of one report month: total, expense count, per-category breakdown with share, and change against the previous month. Never stored.
_Avoid_: recap, statistics, summary

**Report month**:
The calendar month of an expense's `occurred_on` in Asia/Jakarta, written `YYYY-MM`.
_Avoid_: period, billing month, cycle

**Demo session**:
A login into the shared demo user after its data has been reset to a deterministic three-month dataset.
_Avoid_: guest account, sandbox, test account
