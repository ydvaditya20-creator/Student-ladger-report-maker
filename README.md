# Student Fee Ledger & Statement Portal

A high-performance web application designed for school fee management, student ledger tracking, payment statement parsing, and official receipt generation.

## 🚀 Features

- **Initial Clean Upload State**: Starts with a clean manual paste & file import screen. Users can paste text directly, upload text/csv files, or test with demo data.
- **Multi-View Fee Ledger**: 
  - Custom Tabular Report with Dynamic Processing Fee Column
  - Summary View
  - Detailed Fee Breakdown
  - Payment Receipts History
- **Dynamic Fee Head Parsing**: Automatically parses composite tuition fees, transport fees, one-time processing charges, late fine policies, and concession discounts.
- **Official Fee Receipts**: Formatted, printable receipts with amount-in-words conversion and itemized breakdowns.
- **Export & Print**:
  - Export to CSV (Spreadsheet compatible)
  - Clean Print & Save as PDF layout (automatically hides buttons and tabs during print)
- **Responsive & Mobile Ready**: Full touch and landscape printing support on iOS and Android devices.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **CI/CD**: GitHub Actions (`.github/workflows/deploy.yml`)

---

## 💻 Local Development

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
cd student-fee-ledger-portal
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
```
The compiled, production-ready static assets will be in the `dist/` directory.

---

## 🌐 Deploying Live to GitHub Pages using GitHub Actions

This repository includes a ready-to-use GitHub Actions workflow in `.github/workflows/deploy.yml` that automatically builds and deploys your site to GitHub Pages on every push.

### Step 1: Push the Code to GitHub
```bash
git init
git add .
git commit -m "Deploy Student Fee Ledger Portal"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

### Step 2: Enable GitHub Pages in Repository Settings
1. Open your repository on GitHub.
2. Go to **Settings** &rarr; **Pages** (in the left sidebar).
3. Under **Build and deployment** &rarr; **Source**, select **GitHub Actions**.
4. That's it! GitHub Actions will automatically run the `.github/workflows/deploy.yml` workflow, compile the app, and provide your live URL (e.g. `https://YOUR_GITHUB_USERNAME.github.io/YOUR_REPOSITORY_NAME/`).

---

## 📄 License
MIT License
