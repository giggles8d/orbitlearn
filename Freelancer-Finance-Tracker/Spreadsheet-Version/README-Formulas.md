# Spreadsheet Formula Reference

## How to Use These CSV Files

### Google Sheets
1. Open Google Sheets
2. Go to File > Import > Upload each CSV file
3. Each CSV becomes a separate tab - rename the tabs to match: Dashboard, Income Tracker, Expense Tracker, Monthly Budget, Tax Reserve Calculator, Debt Payoff Tracker, Savings Tracker
4. Formulas will auto-activate once all tabs are named correctly

### Excel
1. Open Excel and create a new workbook
2. Import each CSV into a separate worksheet (Data > From Text/CSV)
3. Rename each worksheet tab to match the references in formulas
4. Save as .xlsx

---

## Key Formula Reference

### Dashboard Formulas
| Metric | Formula | Description |
|--------|---------|-------------|
| Total Income | `=SUMPRODUCT(('Income Tracker'!B:B<>"")*'Income Tracker'!D:D*(MONTH('Income Tracker'!B:B)=MONTH(TODAY())))` | Current month income |
| Total Expenses | `=SUMPRODUCT(('Expense Tracker'!B:B<>"")*'Expense Tracker'!D:D*(MONTH('Expense Tracker'!B:B)=MONTH(TODAY())))` | Current month expenses |
| Monthly Profit | `=Total Income - Total Expenses` | Net profit |
| Tax Reserve | `=Total Income * 0.25` | 25% tax set-aside |
| Profit Margin | `=IF(Income>0, Profit/Income*100, 0)` | Profit as % of income |

### Income Tracker Formulas
| Metric | Formula | Description |
|--------|---------|-------------|
| Tax Set-Aside | `=Gross * Tax_Rate / 100` | Per-entry tax reserve |
| Net After Tax | `=Gross - Tax_Set_Aside` | Take-home per entry |
| Income by Source | `=SUMIF(Source_Range, "Client Work", Amount_Range)` | Totals per source |

### Expense Tracker Formulas
| Metric | Formula | Description |
|--------|---------|-------------|
| Category Total | `=SUMIF(Category_Range, "Category", Amount_Range)` | Spending per category |
| % of Total | `=Category_Total / Total_Expenses * 100` | Category proportion |
| Tax Deductible | `=SUMIF(Deductible_Range, "Y", Amount_Range)` | Deductible expenses |

### Tax Reserve Calculator Formulas
| Metric | Formula | Description |
|--------|---------|-------------|
| Quarterly Income | `=SUMPRODUCT with month filters` | Income per quarter |
| Taxable Income | `=Gross - Deductible_Expenses` | After deductions |
| Reserve at 25% | `=Taxable_Income * 0.25` | Conservative estimate |
| Reserve at 30% | `=Taxable_Income * 0.30` | Aggressive estimate |

### Debt Snowball Formulas
| Metric | Formula | Description |
|--------|---------|-------------|
| Total Payment | `=Minimum + Extra` | Monthly payment per debt |
| Payoff Estimate | `=TODAY() + Balance/Payment * 30` | Rough payoff date |
| Auto-sort | Sort by Column C (Balance) ascending | Smallest first |

### Savings Tracker Formulas
| Metric | Formula | Description |
|--------|---------|-------------|
| % Complete | `=Current / Target * 100` | Goal progress |
| Monthly Target | `=(Target - Current) / Months_Remaining` | Required monthly saving |
| Status | `=IF(>=100,"Complete", IF(>=50,"On Track","Behind"))` | Goal health |

---

## Chart Recommendations

### Dashboard Charts
1. **Income vs Expenses Bar Chart** - Use the "Monthly Income vs Expenses" data section (rows 36-42)
2. **Income by Source Pie Chart** - Use Income by Source section (rows 19-24)
3. **Expense Breakdown Pie Chart** - Use Expense Breakdown section (rows 27-33)
4. **Savings Goal Progress** - Horizontal bar chart from Savings Goal Progress section

### How to Create Charts in Google Sheets
1. Select the data range
2. Insert > Chart
3. Choose chart type (Bar, Pie, or Line)
4. Customize colors using the Financial Growth palette: Green (#2D5A27), Slate Grey (#708090), White (#FFFFFF)

### Color Palette for Formatting
- Primary: Financial Growth Green `#2D5A27`
- Secondary: Slate Grey `#708090`
- Background: White `#FFFFFF`
- Accent: Light Green `#90EE90`
- Warning: Soft Red `#DC3545`
- Font: Montserrat (Google Sheets) or Calibri (Excel)
