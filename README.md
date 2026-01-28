# Brochbot Dashboard

Beautiful, professional task dashboard with actual product favicons and real tasks only.

## 🚀 Deploy to Vercel

### Option 1: Deploy with Vercel CLI
```bash
# Install Vercel CLI if you haven't already
npm i -g vercel

# Deploy
cd brochbot-vercel
vercel

# Follow the prompts:
# - Link to existing project or create new
# - Choose project name (e.g., "brochbot")
# - Deploy!
```

### Option 2: Deploy via GitHub
1. Push this folder to a GitHub repository
2. Go to [vercel.com](https://vercel.com)
3. Import the repository
4. Deploy with one click

### Option 3: Drag and Drop
1. Go to [vercel.com/new](https://vercel.com/new)
2. Drag the `brochbot-vercel` folder onto the page
3. Deploy instantly

## 📁 Structure

```
brochbot-vercel/
├── index.html         # Main dashboard
├── tasks.html         # Tasks page (placeholder)
├── analytics.html     # Analytics page (placeholder)
├── competitors.html   # Competitors page (placeholder)
├── style.css          # Clean, minimal styling
├── app.js            # Dashboard logic
└── vercel.json       # Vercel configuration
```

## ✏️ Updating Tasks

Edit the `tasks` object in `app.js`:

```javascript
const tasks = {
    todo: [
        { id: 1, title: "Task title", product: "Product name" }
    ],
    inProgress: [],
    done: []
};
```

## 🎨 Customization

- **Colors**: Edit `style.css`
- **Products**: Update the `products` array in `app.js`
- **Add pages**: Create new HTML files and link them in the nav

## 🔗 After Deployment

Your dashboard will be available at:
- `https://brochbot.vercel.app` (or your chosen subdomain)
- Custom domain can be added in Vercel settings

## 📊 Future Enhancements

Ready to add:
- Real-time task updates via API
- Analytics integration
- Competitor monitoring dashboard
- UGC creator tracking
- Interactive task management

---

Built by Brochbot 🤖