// Task data
const tasks = {
    todo: [
        { id: 2, title: "Research competitor pricing for Interview Sidekick", product: "Interview Sidekick" },
        { id: 3, title: "Analyze top 5 interview prep competitors", product: "Interview Sidekick" },
        { id: 4, title: "Research CRM integrations for Sales Echo", product: "Sales Echo" },
        { id: 5, title: "Fix template loading bug", product: "Cover Letter Copilot" },
        { id: 6, title: "Track Rezi.ai new features weekly", product: "Competitor Research" },
        { id: 7, title: "Monitor Pramp pricing changes", product: "Competitor Research" },
        { id: 8, title: "Add Stripe payment integration", product: "Sales Echo" },
        { id: 11, title: "Create UGC creator payment tracker", product: "Automation" },
        { id: 12, title: "Connect to analytics platform for daily reports", product: "Automation" }
    ],
    inProgress: [
        { id: 10, title: "Build competitor webpage monitoring system", product: "Automation" }
    ],
    done: [
        { id: 1, title: "Set up morning briefing at 7 AM Cape Town time", product: "System" },
        { id: 9, title: "Create Brochbot tracker", product: "System" }
    ]
};

// Products data
const products = [
    { name: "Interview Sidekick", icon: "🎤" },
    { name: "Sales Echo", icon: "📢" },
    { name: "Cover Letter Copilot", icon: "✉️" },
    { name: "Competitor Research", icon: "🔍" },
    { name: "Automation", icon: "⚙️" },
    { name: "System", icon: "🤖" }
];

// Update stats
function updateStats() {
    const total = tasks.todo.length + tasks.inProgress.length + tasks.done.length;
    const progress = total > 0 ? Math.round((tasks.done.length / total) * 100) : 0;
    
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('todo-count').textContent = tasks.todo.length;
    document.getElementById('progress-count').textContent = tasks.inProgress.length;
    document.getElementById('done-count').textContent = tasks.done.length;
    document.getElementById('progress-percent').textContent = progress + '%';
}

// Render products
function renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    const productStats = {};
    
    // Calculate stats per product
    products.forEach(product => {
        productStats[product.name] = {
            todo: tasks.todo.filter(t => t.product === product.name),
            inProgress: tasks.inProgress.filter(t => t.product === product.name),
            done: tasks.done.filter(t => t.product === product.name)
        };
    });
    
    // Render only products with tasks
    grid.innerHTML = products
        .filter(product => {
            const stats = productStats[product.name];
            return stats.todo.length + stats.inProgress.length + stats.done.length > 0;
        })
        .map(product => {
            const stats = productStats[product.name];
            const total = stats.todo.length + stats.inProgress.length + stats.done.length;
            const progress = total > 0 ? Math.round((stats.done.length / total) * 100) : 0;
            
            return `
                <div class="product-card">
                    <div class="product-header">
                        <h3 class="product-title">${product.icon} ${product.name}</h3>
                    </div>
                    <div class="product-meta">
                        <div class="meta-item">
                            <span class="meta-number">${stats.todo.length}</span>
                            <span>to do</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-number">${stats.inProgress.length}</span>
                            <span>in progress</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-number">${stats.done.length}</span>
                            <span>done</span>
                        </div>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <div class="progress-label">
                            <span>${progress}% complete</span>
                            <span>${total} tasks</span>
                        </div>
                    </div>
                    <div class="task-list">
                        ${stats.todo.map(task => `
                            <div class="task-item">
                                <span class="task-status status-todo"></span>
                                <span class="task-id">#${task.id}</span>
                                <span>${task.title}</span>
                            </div>
                        `).join('')}
                        ${stats.inProgress.map(task => `
                            <div class="task-item">
                                <span class="task-status status-progress"></span>
                                <span class="task-id">#${task.id}</span>
                                <span>${task.title}</span>
                            </div>
                        `).join('')}
                        ${stats.done.slice(0, 2).map(task => `
                            <div class="task-item">
                                <span class="task-status status-done"></span>
                                <span class="task-id">#${task.id}</span>
                                <span>${task.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
}

// Render kanban board
function renderBoard() {
    const board = document.getElementById('kanban-board');
    if (!board) return;
    
    board.innerHTML = `
        <div class="column column-todo">
            <div class="column-header">
                <span class="column-title">To Do</span>
                <span class="column-count">${tasks.todo.length}</span>
            </div>
            <div class="column-tasks">
                ${tasks.todo.map(task => `
                    <div class="board-task">
                        <div class="board-task-title">${task.title}</div>
                        <div class="board-task-meta">
                            <span class="board-task-product">${task.product}</span>
                            <span class="board-task-id">#${task.id}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="column column-progress">
            <div class="column-header">
                <span class="column-title">In Progress</span>
                <span class="column-count">${tasks.inProgress.length}</span>
            </div>
            <div class="column-tasks">
                ${tasks.inProgress.map(task => `
                    <div class="board-task">
                        <div class="board-task-title">${task.title}</div>
                        <div class="board-task-meta">
                            <span class="board-task-product">${task.product}</span>
                            <span class="board-task-id">#${task.id}</span>
                        </div>
                    </div>
                `).join('')}
                ${tasks.inProgress.length === 0 ? '<div class="empty-state">No tasks in progress</div>' : ''}
            </div>
        </div>
        
        <div class="column column-done">
            <div class="column-header">
                <span class="column-title">Done</span>
                <span class="column-count">${tasks.done.length}</span>
            </div>
            <div class="column-tasks">
                ${tasks.done.map(task => `
                    <div class="board-task">
                        <div class="board-task-title">${task.title}</div>
                        <div class="board-task-meta">
                            <span class="board-task-product">${task.product}</span>
                            <span class="board-task-id">#${task.id}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Update time
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    });
    const element = document.getElementById('last-updated');
    if (element) {
        element.textContent = timeString;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateStats();
    renderProducts();
    renderBoard();
    updateTime();
    
    // Update time every minute
    setInterval(updateTime, 60000);
});