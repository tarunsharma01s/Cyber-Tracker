import React, { useState, useEffect, useRef } from 'react';
import { db, auth, googleProvider } from './firebase'; 
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  where, 
  serverTimestamp,
  writeBatch, 
  getDocs     
} from 'firebase/firestore';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Trash2, TrendingUp, TrendingDown, AlertTriangle, 
  Wallet, FolderOpen, PieChart as PieIcon, ChevronDown, Check,
  Calendar, Clock, Filter, Pencil, Lock, Plus, X, LogOut, Shield,
  PlusCircle, Edit3, AlertOctagon, Rocket, Download, Info, Youtube, Globe, Github,
  Cpu, Zap, Hexagon, Activity, FileSpreadsheet, ShieldCheck, ThumbsUp, HeartPulse, CheckCircle, 
  ListTodo, CheckSquare, Coins, Archive, LayoutGrid, BarChart3, User, History
} from 'lucide-react';

// --- MINIMAL LOGO COMPONENT ---
const MinimalLogo = ({ size = "default", animated = false }) => {
    const isLarge = size === "large";
    const iconSize = isLarge ? 64 : 32;
    const textSize = isLarge ? "text-5xl" : "text-3xl";
    const spacing = isLarge ? "gap-4" : "gap-3";
  
    return (
      <div className={`flex items-center justify-center ${spacing} select-none`}>
        <div className="relative group">
          <div className={`absolute inset-0 bg-neon-green/20 blur-xl rounded-full transition-opacity duration-1000 ${animated ? 'animate-pulse' : ''} ${isLarge ? 'opacity-100' : 'opacity-0'}`}></div>
          <ShieldCheck size={iconSize} className="text-neon-green relative z-10 drop-shadow-[0_0_15px_rgba(0,255,159,0.5)]" strokeWidth={1.5} />
        </div>
        <h1 className={`${textSize} font-bold tracking-tight flex items-baseline font-sans`}>
          <span className="text-white">Cyber</span>
          <span className="text-neon-purple">Tracker</span>
        </h1>
      </div>
    );
};

// --- SMART AVATAR COMPONENT ---
const UserAvatar = ({ user, onClick }) => {
  const [imgError, setImgError] = useState(false);

  if (user.photoURL && !imgError) {
    return (
      <img 
        src={user.photoURL} 
        alt="User" 
        className="w-12 h-12 rounded-full border-2 border-neon-purple cursor-pointer shadow-[0_0_10px_rgba(176,38,255,0.3)] object-cover hover:scale-105 transition-transform" 
        onClick={onClick}
        onError={() => setImgError(true)}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div 
      onClick={onClick}
      className="w-12 h-12 rounded-full border-2 border-neon-purple cursor-pointer shadow-[0_0_10px_rgba(176,38,255,0.3)] bg-gray-900 flex items-center justify-center hover:scale-105 transition-transform"
    >
      <span className="text-neon-purple font-bold text-xl">
        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User size={20}/>}
      </span>
    </div>
  );
};

// --- CYBER PROGRESS BAR COMPONENT ---
const CyberProgressBar = ({ current, max, label }) => {
  const percentage = Math.min((current / max) * 100, 100);
  const isBreached = current > max;
  
  let barColor = "bg-neon-green";
  let glowColor = "shadow-[0_0_10px_#00ff9f]";
  
  if (isBreached) {
    barColor = "bg-neon-purple animate-pulse"; 
    glowColor = "shadow-[0_0_15px_#b026ff]";
  } else if (percentage > 85) {
    barColor = "bg-neon-red"; 
    glowColor = "shadow-[0_0_10px_#ff2a6d]";
  } else if (percentage > 50) {
    barColor = "bg-yellow-500"; 
    glowColor = "shadow-[0_0_10px_#eab308]";
  }

  return (
    <div className="w-full space-y-2 mb-6 mt-2">
      <div className="flex justify-between items-end text-xs font-bold uppercase tracking-wider text-gray-400">
        <span>{label} Usage</span>
        <span className={isBreached ? "text-neon-purple" : "text-white"}>
          {Math.round((current / max) * 100)}%
        </span>
      </div>
      <div className="h-4 bg-gray-900 rounded-full overflow-hidden border border-gray-700 relative">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor} ${glowColor}`} 
          style={{ width: `${isBreached ? 100 : percentage}%` }}
        >
            <div className="absolute top-0 left-0 w-full h-[50%] bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

// --- SHARED FORM COMPONENT ---
const TransactionForm = ({ onSubmit, editingId, workspace, formData, setFormData, onCancel }) => {
  return (
    <form onSubmit={onSubmit} className={`bg-card/80 backdrop-blur-md p-6 rounded-xl border ${editingId ? 'border-neon-purple shadow-[0_0_15px_rgba(176,38,255,0.2)]' : 'border-gray-800'} transition-all`}>
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        {editingId ? <span className="text-neon-purple flex items-center gap-2"><Pencil size={20}/> Edit Transaction</span> : <span className="text-neon-green flex items-center gap-2">New Transaction <span className="text-xs text-gray-500 font-normal">(in {workspace})</span></span>}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input type="text" placeholder="Description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="bg-dark/50 border border-gray-700 rounded p-3 focus:border-neon-green outline-none text-white placeholder-gray-500" />
        <input type="number" placeholder="Amount" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="bg-dark/50 border border-gray-700 rounded p-3 focus:border-neon-green outline-none text-white placeholder-gray-500" />
        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="bg-dark/50 border border-gray-700 rounded p-3 focus:border-neon-green outline-none text-white">
          <option>Food</option><option>Groceries</option><option>Rent</option><option>Utilities</option><option>Entertainment</option><option>Transport</option><option>Health</option><option>Shopping</option><option>Tech</option><option>Education</option><option>Other</option><option disabled>--- Income ---</option><option>Salary</option><option>Freelance</option><option>Investment</option>
        </select>
        <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="bg-dark/50 border border-gray-700 rounded p-3 focus:border-neon-green outline-none text-white">
          <option value="expense">Expense</option><option value="income">Income</option>
        </select>
      </div>
      <div className="flex gap-2 mt-4">
        <button className={`flex-1 py-3 rounded hover:text-white transition-all font-bold tracking-widest uppercase ${editingId ? 'bg-neon-purple text-white hover:bg-neon-purple/80' : 'bg-neon-purple/20 text-neon-purple border border-neon-purple hover:bg-neon-purple'}`}>
          {editingId ? 'Update Transaction' : 'Add Transaction'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-3 rounded border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">Cancel</button>
      </div>
    </form>
  );
};

const App = () => {
  const [user, setUser] = useState(null); 
  const [expenses, setExpenses] = useState([]);
  const [tasks, setTasks] = useState([]); 
  const [archives, setArchives] = useState([]); // NEW STATE for Monthly History
  const [loading, setLoading] = useState(true); 
  const [splashLoading, setSplashLoading] = useState(true); 
  const [activeTab, setActiveTab] = useState('dashboard'); 
  
  const [budgetLimits, setBudgetLimits] = useState(() => {
    const saved = localStorage.getItem('cyberTracker_budgets');
    return saved ? JSON.parse(saved) : { monthly: 5000, yearly: 60000 };
  });

  const [workspace, setWorkspace] = useState('Personal'); 
  const [showFolderMenu, setShowFolderMenu] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const folderMenuRef = useRef(null);
  const [timeFilter, setTimeFilter] = useState(() => window.innerWidth < 768 ? 'monthly' : 'lifetime');
  const [lifetimeGraphType, setLifetimeGraphType] = useState('pie'); 
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [chartView, setChartView] = useState('expense'); 
  const [editingId, setEditingId] = useState(null); 
  const [isMobileFormOpen, setIsMobileFormOpen] = useState(false);
  const [folderAction, setFolderAction] = useState({ type: null, folder: '', newName: '' });
  const [showWelcome, setShowWelcome] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showTrackRecord, setShowTrackRecord] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  const [completingTask, setCompletingTask] = useState(null);
  const [taskExpenseAmount, setTaskExpenseAmount] = useState('');

  const [formData, setFormData] = useState({ description: '', amount: '', category: 'Food', type: 'expense' });
  const [newTaskTitle, setNewTaskTitle] = useState(''); 

  useEffect(() => { localStorage.setItem('cyberTracker_budgets', JSON.stringify(budgetLimits)); }, [budgetLimits]);
  useEffect(() => { const timer = setTimeout(() => { setSplashLoading(false); }, 2500); const unsubscribe = onAuthStateChanged(auth, (currentUser) => { setUser(currentUser); if (!currentUser) setLoading(false); }); return () => { unsubscribe(); clearTimeout(timer); }; }, []);
  
  useEffect(() => { 
    if (!user) return; 
    
    const qExpenses = query(collection(db, 'expenses'), where("uid", "==", user.uid), orderBy('createdAt', 'desc')); 
    const unsubExpenses = onSnapshot(qExpenses, (snapshot) => { const expensesData = snapshot.docs.map(doc => { const data = doc.data(); const dateObj = data.createdAt ? data.createdAt.toDate() : new Date(); const editedDateObj = data.editedAt ? data.editedAt.toDate() : null; return { id: doc.id, ...data, dateObj, editedDateObj }; }); setExpenses(expensesData); setLoading(false); if (expensesData.length === 0 && !sessionStorage.getItem('welcomeDismissed')) { setShowWelcome(true); } else { setShowWelcome(false); } }); 
    
    const qTasks = query(collection(db, 'tasks'), where("uid", "==", user.uid), orderBy('createdAt', 'desc'));
    const unsubTasks = onSnapshot(qTasks, (snapshot) => { const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setTasks(tasksData); }, (error) => { if (error.code === 'failed-precondition') console.log("Missing Index for Tasks"); });
    
    // NEW FETCH for Monthly History
    const qArchives = query(collection(db, 'archives'), where("uid", "==", user.uid), orderBy('archivedAt', 'desc'));
    const unsubArchives = onSnapshot(qArchives, (snapshot) => { const archiveData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); setArchives(archiveData); }, (error) => { if (error.code === 'failed-precondition') console.log("Missing Index for Archives"); });

    const handleClickOutside = (event) => { if (folderMenuRef.current && !folderMenuRef.current.contains(event.target)) { setShowFolderMenu(false); } }; 
    document.addEventListener("mousedown", handleClickOutside); 
    return () => { unsubExpenses(); unsubTasks(); unsubArchives(); document.removeEventListener("mousedown", handleClickOutside); }; 
  }, [user]);

  const availableYears = [...new Set(expenses.map(e => e.dateObj.getFullYear()))].sort((a,b) => b-a);
  if (!availableYears.includes(new Date().getFullYear())) availableYears.unshift(new Date().getFullYear());
  const currentData = expenses.filter(item => { const itemYear = item.dateObj.getFullYear(); const itemMonth = item.dateObj.getMonth(); if (timeFilter === 'lifetime') return true; const itemFolder = item.folder || 'Personal'; if (itemFolder !== workspace) return false; if (timeFilter === 'yearly') return itemYear === Number(selectedYear); if (timeFilter === 'monthly') return itemYear === Number(selectedYear) && itemMonth === Number(selectedMonth); return false; });
  const totalBalance = currentData.reduce((acc, curr) => curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0);
  const totalExpense = currentData.filter(e => e.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalIncome = currentData.filter(e => e.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Handlers
  const handleLogin = async () => { try { await signInWithPopup(auth, googleProvider); } catch (error) { console.error("Login failed", error); } };
  const handleLogout = async () => { await signOut(auth); setExpenses([]); setTasks([]); setShowWelcome(false); sessionStorage.removeItem('welcomeDismissed'); };
  const handleStartTracking = () => { setShowWelcome(false); sessionStorage.setItem('welcomeDismissed', 'true'); setTimeFilter('monthly'); if (window.innerWidth < 768) { setIsMobileFormOpen(true); } };
  const handleSubmit = async (e) => { e.preventDefault(); if (!formData.description || !formData.amount) return; if (editingId) { await updateDoc(doc(db, 'expenses', editingId), { ...formData, amount: Number(formData.amount), isEdited: true, editedAt: serverTimestamp() }); setEditingId(null); } else { await addDoc(collection(db, 'expenses'), { ...formData, amount: Number(formData.amount), uid: user.uid, folder: workspace, createdAt: serverTimestamp(), date: new Date().toLocaleDateString(), isEdited: false }); } setFormData({ description: '', amount: '', category: 'Food', type: 'expense' }); setIsMobileFormOpen(false); };
  const handleQuickAdd = (type) => { setFormData(prev => ({ ...prev, type: type })); setIsMobileFormOpen(true); };
  const handleEditClick = (item) => { if (item.isEdited) return; setEditingId(item.id); setFormData({ description: item.description, amount: item.amount, category: item.category, type: item.type }); setIsMobileFormOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const handleCancelEdit = () => { setEditingId(null); setFormData({ description: '', amount: '', category: 'Food', type: 'expense' }); setIsMobileFormOpen(false); };
  const handleDelete = async (id) => { await deleteDoc(doc(db, 'expenses', id)); if (editingId === id) handleCancelEdit(); };
  const selectFolder = (folderName) => { setWorkspace(folderName); setShowFolderMenu(false); };
  const initRenameFolder = (e, folder) => { e.stopPropagation(); setFolderAction({ type: 'rename', folder: folder, newName: folder }); setShowFolderMenu(false); };
  const initDeleteFolder = (e, folder) => { e.stopPropagation(); setFolderAction({ type: 'delete', folder: folder, newName: '' }); setShowFolderMenu(false); };
  const performFolderRename = async () => { if (!folderAction.newName || folderAction.newName === folderAction.folder) return; const batch = writeBatch(db); const q = query(collection(db, 'expenses'), where('uid', '==', user.uid), where('folder', '==', folderAction.folder)); const snapshot = await getDocs(q); snapshot.docs.forEach((doc) => batch.update(doc.ref, { folder: folderAction.newName })); await batch.commit(); if (workspace === folderAction.folder) setWorkspace(folderAction.newName); setFolderAction({ type: null, folder: '', newName: '' }); };
  const performFolderDelete = async () => { const batch = writeBatch(db); const q = query(collection(db, 'expenses'), where('uid', '==', user.uid), where('folder', '==', folderAction.folder)); const snapshot = await getDocs(q); snapshot.docs.forEach((doc) => batch.delete(doc.ref)); await batch.commit(); if (workspace === folderAction.folder) setWorkspace('Personal'); setFolderAction({ type: null, folder: '', newName: '' }); };
  const handleExport = () => { const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Folder']; const rows = currentData.map(item => [item.date, `"${item.description}"`, item.category, item.type, item.amount, item.folder || 'Personal']); const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.setAttribute('download', `CyberTracker_Export_${new Date().toISOString().slice(0,10)}.csv`); document.body.appendChild(link); link.click(); document.body.removeChild(link); };
  
  // NEW ARCHIVE & DELETE LOGIC
  const handleClearMonth = async () => { 
    handleExport(); // Backup to CSV first

    const batch = writeBatch(db); 
    
    // Create an Archive Record
    const archiveData = {
        uid: user.uid,
        year: selectedYear,
        month: selectedMonth,
        totalIncome: totalIncome,
        totalExpense: totalExpense,
        balance: totalBalance,
        workspace: workspace,
        archivedAt: serverTimestamp()
    };
    const archiveRef = doc(collection(db, 'archives'));
    batch.set(archiveRef, archiveData);

    // Delete Raw Transactions
    currentData.forEach((docItem) => { 
        const docRef = doc(db, 'expenses', docItem.id); 
        batch.delete(docRef); 
    }); 
    
    await batch.commit(); 
    setShowClearConfirm(false); 
  };

  const handleAddTask = async (e) => { e.preventDefault(); if (!newTaskTitle.trim()) return; try { await addDoc(collection(db, 'tasks'), { title: newTaskTitle, uid: user.uid, completed: false, createdAt: serverTimestamp() }); setNewTaskTitle(''); } catch (error) { console.error("Error adding task:", error); } };
  const initiateTaskCompletion = (task) => { if (task.completed) return; setCompletingTask(task); setTaskExpenseAmount(''); };
  const confirmTaskExpense = async (isPaid) => { if (!completingTask) return; await updateDoc(doc(db, 'tasks', completingTask.id), { completed: true }); if (isPaid && taskExpenseAmount) { await addDoc(collection(db, 'expenses'), { description: completingTask.title, amount: Number(taskExpenseAmount), category: 'Other', type: 'expense', uid: user.uid, folder: workspace, createdAt: serverTimestamp(), date: new Date().toLocaleDateString(), isEdited: false }); } setCompletingTask(null); setTaskExpenseAmount(''); };
  const deleteTask = async (id) => { await deleteDoc(doc(db, 'tasks', id)); };

  const getChartData = (type) => currentData.filter(e => e.type === type).reduce((acc, curr) => { const existing = acc.find(item => item.name === curr.category); if (existing) { existing.value += Number(curr.amount); } else { acc.push({ name: curr.category, value: Number(curr.amount) }); } return acc; }, []);
  const expenseChartData = getChartData('expense'); const incomeChartData = getChartData('income'); const toggleChartData = chartView === 'expense' ? expenseChartData : incomeChartData;
  const getTrendData = (type) => { const grouped = currentData.filter(e => e.type === type).reduce((acc, curr) => { const sortKey = `${curr.dateObj.getFullYear()}-${String(curr.dateObj.getMonth() + 1).padStart(2, '0')}`; if (!acc[sortKey]) acc[sortKey] = 0; acc[sortKey] += Number(curr.amount); return acc; }, {}); return Object.keys(grouped).sort().map(key => { const [year, month] = key.split('-'); const dateObj = new Date(Number(year), Number(month) - 1); const dateLabel = dateObj.toLocaleString('default', { month: 'short', year: 'numeric' }); return { name: dateLabel, value: grouped[key] }; }); };
  const incomeTrendData = getTrendData('income'); const expenseTrendData = getTrendData('expense');
  const savedFolders = ['Personal', ...new Set(expenses.map(item => item.folder).filter(f => f && f !== 'Personal'))];
  const COLORS = ['#00ff9f', '#b026ff', '#ff2a6d', '#00b8ff', '#ffd700', '#ff8c00'];
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const getTrackRecordStatus = () => {
    const effectiveBudget = timeFilter === 'yearly' ? budgetLimits.yearly : budgetLimits.monthly;
    const isLifetime = timeFilter === 'lifetime';
    let status = 'good'; let title = "Excellent"; let message = "You are doing great! Keep it up."; let percentage = 0; 
    if (totalIncome > 0 && totalExpense > totalIncome) { status = 'critical'; title = "CRITICAL DEFICIT"; message = `You have spent ₹${(totalExpense - totalIncome).toLocaleString()} more than you earned.`; percentage = 100; }
    else if (!isLifetime && totalExpense > effectiveBudget && totalExpense < (totalIncome * 0.5)) { status = 'good'; title = "SAFE BUT OVER BUDGET"; message = "Over budget, but safe due to high income."; percentage = (totalExpense / effectiveBudget) * 100; }
    else if (!isLifetime && totalExpense > effectiveBudget) { status = 'warning'; title = "BUDGET BREACHED"; message = `Exceeded ${timeFilter} limit of ₹${effectiveBudget.toLocaleString()}.`; percentage = (totalExpense / effectiveBudget) * 100; }
    else if (totalIncome > 0 && totalExpense > (totalIncome * 0.9)) { status = 'warning'; title = "CASH FLOW TIGHT"; message = "Spending over 90% of income."; percentage = 90; }
    else if (!isLifetime && totalExpense > (effectiveBudget * 0.8)) { status = 'warning'; title = "APPROACHING LIMIT"; message = "Used over 80% of budget."; percentage = (totalExpense / effectiveBudget) * 100; }
    else { status = 'good'; title = "EXCELLENT HEALTH"; message = "Staying well within budget limits."; percentage = (!isLifetime && effectiveBudget > 0) ? (totalExpense / effectiveBudget) * 100 : 0; }
    return { status, title, message, percentage };
  };
  const recordStats = getTrackRecordStatus();
  const getCurrentBudgetLimit = () => { if (timeFilter === 'yearly') return budgetLimits.yearly; return budgetLimits.monthly; };
  const handleBudgetChange = (val) => { if (timeFilter === 'yearly') { setBudgetLimits(prev => ({ ...prev, yearly: Number(val) })); } else { setBudgetLimits(prev => ({ ...prev, monthly: Number(val) })); } };

  const getYearlyBreakdown = () => {
    const monthlyStats = Array(12).fill(0).map(() => ({ expense: 0, count: 0 }));
    currentData.forEach(item => { if (item.type === 'expense') { const monthIdx = item.dateObj.getMonth(); monthlyStats[monthIdx].expense += Number(item.amount); monthlyStats[monthIdx].count += 1; } });
    return monthlyStats.map((stat, index) => { const percent = (stat.expense / budgetLimits.monthly) * 100; let status = 'neutral'; if (stat.expense > 0) { if (percent > 100) status = 'critical'; else if (percent >= 80) status = 'warning'; else status = 'good'; } return { ...stat, status, name: MONTHS[index].slice(0,3) }; });
  };
  const isEndOfMonth = () => { const today = new Date(); const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate(); return today.getDate() >= (lastDay - 5); };

  if (splashLoading || loading) return (<div className="min-h-screen bg-black flex flex-col items-center justify-center relative"><div className="absolute inset-0 bg-gradient-to-r from-neon-purple/20 via-black to-black animate-pulse"></div><MinimalLogo size="large" animated={true} /></div>);
  if (!user) return (<div className="min-h-screen bg-black flex flex-col items-center justify-center"><MinimalLogo size="large" /><button onClick={handleLogin} className="mt-8 bg-white text-black font-bold py-4 px-8 rounded-lg">Sign in with Google</button></div>);
  if (showWelcome) return (<div className="min-h-screen bg-black flex flex-col items-center justify-center"><MinimalLogo size="large" /><h1 className="text-white text-3xl font-bold mt-4">Welcome!</h1><button onClick={handleStartTracking} className="mt-8 bg-neon-purple text-white px-8 py-3 rounded-lg font-bold">Start Tracking</button></div>);

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 md:p-8 pb-24 animate-in fade-in duration-300 relative overflow-x-hidden"> 
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20 pointer-events-none z-0"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        
        {timeFilter === 'monthly' && isEndOfMonth() && activeTab === 'dashboard' && (
          <div className="bg-gradient-to-r from-neon-purple/20 to-neon-green/20 border border-gray-700 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500">
             <div className="flex items-center gap-4"><div className="p-2 bg-neon-green/20 rounded-full"><Archive size={24} className="text-neon-green" /></div><div><h3 className="font-bold text-white text-lg">Monthly Wrap-Up</h3><p className="text-xs text-gray-400">Export your data, archive it, and clear the dashboard for a fresh start.</p></div></div>
             <div className="flex gap-2"><button onClick={handleExport} className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-bold hover:bg-gray-700 flex items-center gap-2"><Download size={14}/> Export</button><button onClick={() => setShowClearConfirm(true)} className="px-4 py-2 bg-neon-red/20 text-neon-red border border-neon-red/50 rounded-lg text-sm font-bold hover:bg-neon-red/30 flex items-center gap-2"><Archive size={14}/> Archive Month</button></div>
          </div>
        )}

        <header className="flex flex-col gap-6 border-b border-gray-800 pb-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
               {/* User Menu - FIXED AVATAR */}
               <div className="relative group" onMouseEnter={() => setIsUserMenuOpen(true)} onMouseLeave={() => setIsUserMenuOpen(false)}>
                 <UserAvatar user={user} onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} />
                 {isUserMenuOpen && (
                    <div className="absolute top-10 left-0 pt-4 z-50 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="bg-card border border-gray-700 rounded p-2 shadow-xl backdrop-blur-xl bg-black/90">
                        <p className="text-sm font-bold text-white truncate px-2">{user.displayName}</p>
                        <p className="text-xs text-gray-500 truncate px-2 mb-2">{user.email}</p>
                        <div className="h-px bg-gray-800 my-2"></div>
                        <button onClick={() => setShowAbout(true)} className="w-full text-left text-gray-300 text-sm hover:bg-gray-800 p-2 rounded flex items-center gap-2 mb-1 transition-colors"><Info size={14} className="text-neon-green"/> About Developer</button>
                        <button onClick={handleLogout} className="w-full text-left text-neon-red text-sm hover:bg-gray-800 p-2 rounded flex items-center gap-2"><LogOut size={14} /> Sign Out</button>
                        </div>
                    </div>
                 )}
               </div>
               <div className="hidden md:block"><MinimalLogo size="default" /></div>
               <div className={`relative z-[60] transition-opacity ${timeFilter === 'lifetime' ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`} ref={folderMenuRef}>
                  <div className="flex items-center gap-0 bg-card/50 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg group focus-within:border-neon-purple transition-colors">
                    <div className="pl-3 py-2 text-gray-400"><FolderOpen className="w-5 h-5" /></div>
                    <input type="text" value={workspace} onChange={(e) => setWorkspace(e.target.value)} onFocus={() => setShowFolderMenu(true)} className="bg-transparent text-neon-green font-bold outline-none px-3 py-2 w-32 md:w-40 placeholder-gray-600" placeholder="Folder Name" />
                    <button onClick={() => setShowFolderMenu(!showFolderMenu)} className="px-3 py-2 border-l border-gray-700 hover:bg-gray-800 rounded-r-lg text-gray-400"><ChevronDown size={16} /></button>
                  </div>
                  {showFolderMenu && (
                    <div className="absolute top-full left-0 mt-2 w-full min-w-[200px] bg-card border border-gray-700 rounded-lg shadow-2xl overflow-hidden z-[60]">
                      <div className="max-h-60 overflow-y-auto bg-black">
                        {savedFolders.map((folder) => (
                          <div key={folder} className="group flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-gray-900 transition-colors cursor-pointer" onClick={() => selectFolder(folder)}>
                              <div className="flex items-center gap-2 flex-1"><span className="font-medium text-gray-200 group-hover:text-neon-green">{folder}</span>{workspace === folder && <Check size={14} className="text-neon-green" />}</div>
                              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={(e) => initRenameFolder(e, folder)} className="text-gray-500 hover:text-white p-1" title="Rename"><Edit3 size={14} /></button>
                                {folder !== 'Personal' && <button onClick={(e) => initDeleteFolder(e, folder)} className="text-gray-500 hover:text-neon-red p-1" title="Delete"><Trash2 size={14} /></button>}
                              </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            </div>
            
            {/* UPDATED TABS */}
            <div className="flex bg-gray-900 border border-gray-800 rounded-full p-1 self-center">
                <button onClick={() => setActiveTab('dashboard')} className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-neon-green text-black' : 'text-gray-400 hover:text-white'}`}><Activity size={16} /> <span className="hidden sm:inline">Dashboard</span></button>
                <button onClick={() => setActiveTab('tasks')} className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'tasks' ? 'bg-neon-purple text-white' : 'text-gray-400 hover:text-white'}`}><ListTodo size={16} /> <span className="hidden sm:inline">Missions</span></button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}><History size={16} /> <span className="hidden sm:inline">History</span></button>
            </div>
          </div>
          {activeTab === 'dashboard' && (
            <div className="flex flex-wrap items-center gap-3 bg-card/30 backdrop-blur-sm p-2 rounded-lg border border-gray-800 z-10 relative">
                <div className="flex bg-dark/50 rounded p-1">
                {['lifetime', 'yearly', 'monthly'].map((type) => (
                    <button key={type} onClick={() => setTimeFilter(type)} className={`px-3 py-1 text-xs rounded font-bold uppercase transition-all ${timeFilter === type ? 'bg-neon-purple text-white' : 'text-gray-500 hover:text-white'}`}>{type}</button>
                ))}
                </div>
                <button onClick={handleExport} className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center gap-1 text-xs font-bold transition-colors ml-2"><Download size={14} /> <span className="hidden sm:inline">Export</span></button>
                {(timeFilter === 'yearly' || timeFilter === 'monthly') && (
                <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="bg-dark border border-gray-700 rounded px-3 py-1 text-sm outline-none focus:border-neon-green ml-auto sm:ml-2 text-gray-300">
                    {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                )}
                {timeFilter === 'monthly' && (
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="bg-dark border border-gray-700 rounded px-3 py-1 text-sm outline-none focus:border-neon-green text-gray-300">
                    {MONTHS.map((month, index) => <option key={month} value={index}>{month}</option>)}
                </select>
                )}
            </div>
          )}
        </header>

        {activeTab === 'dashboard' && (
            <>
                {timeFilter !== 'lifetime' && recordStats.status !== 'good' && (
                <div className={`p-4 rounded-lg flex items-center justify-between gap-3 animate-pulse backdrop-blur-sm border ${recordStats.status === 'critical' ? 'bg-neon-red/10 border-neon-red text-neon-red' : 'bg-yellow-500/10 border-yellow-500 text-yellow-500'}`}>
                    <div className="flex items-center gap-3">
                    {recordStats.status === 'critical' ? <AlertOctagon /> : <AlertTriangle />}
                    <span className="font-bold uppercase text-xs md:text-sm">{recordStats.title}: {recordStats.status === 'critical' ? `Overspent` : `Limit Reached`}</span>
                    </div>
                    <button onClick={() => setShowTrackRecord(true)} className="underline text-sm font-bold hover:text-white whitespace-nowrap">Check Health</button>
                </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg"><div className="flex items-center gap-3 mb-2 text-gray-400"><Wallet className="w-5 h-5" /> <span>Balance ({timeFilter === 'lifetime' ? 'All' : workspace})</span></div><div className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-white' : 'text-neon-red'}`}>₹{totalBalance.toLocaleString()}</div></div>
                <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg"><div className="flex items-center gap-3 mb-2 text-gray-400"><TrendingDown className="w-5 h-5 text-neon-green" /> <span>Income</span></div><div className="text-3xl font-bold text-neon-green">+₹{totalIncome.toLocaleString()}</div></div>
                <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg"><div className="flex items-center gap-3 mb-2 text-gray-400"><TrendingUp className="w-5 h-5 text-neon-red" /> <span>Expense</span></div><div className="text-3xl font-bold text-neon-red">-₹{totalExpense.toLocaleString()}</div></div>
                </div>

                {timeFilter === 'lifetime' ? (
                    <div>
                        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                        <button onClick={() => setShowTrackRecord(true)} className="w-full md:w-auto px-4 py-2 bg-gradient-to-r from-neon-purple to-neon-blue text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-[0_0_15px_rgba(176,38,255,0.4)]"><HeartPulse size={16} /> Health Check</button>
                        <div className="bg-gray-900 border border-gray-700 p-1 rounded-lg flex gap-1"><button onClick={() => setLifetimeGraphType('pie')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${lifetimeGraphType === 'pie' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}><PieIcon size={16} /> PIE</button><button onClick={() => setLifetimeGraphType('spline')} className={`px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-all ${lifetimeGraphType === 'spline' ? 'bg-gray-700 text-white shadow-md' : 'text-gray-500 hover:text-white'}`}><Activity size={16} /> TRENDS</button></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 hover:border-neon-green/30 transition-all"><h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-neon-green">{lifetimeGraphType === 'pie' ? <PieIcon className="w-5 h-5" /> : <Activity className="w-5 h-5" />} Lifetime Income</h2><div className="h-80 flex items-center justify-center">{incomeChartData.length > 0 ? (<ResponsiveContainer width="100%" height="100%">{lifetimeGraphType === 'pie' ? (<PieChart><Pie data={incomeChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">{incomeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(value) => `₹${value}`} /><Legend /></PieChart>) : (<AreaChart data={incomeTrendData}><defs><linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00ff9f" stopOpacity={0.3}/><stop offset="95%" stopColor="#00ff9f" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" /> <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 10}} /> <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} /> <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#00ff9f', borderRadius: '8px' }} itemStyle={{ color: '#00ff9f' }} formatter={(value) => `₹${value}`} /> <Area type="monotone" dataKey="value" stroke="#00ff9f" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" /></AreaChart>)}</ResponsiveContainer>) : (<button onClick={() => handleQuickAdd('income')} className="flex flex-col items-center gap-3 text-gray-600 hover:text-neon-green transition-colors group"><PlusCircle size={48} className="group-hover:scale-110 transition-transform" /><span className="font-bold">Add Your First Income</span></button>)}</div></div>
                        <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 hover:border-neon-red/30 transition-all"><h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-neon-red">{lifetimeGraphType === 'pie' ? <PieIcon className="w-5 h-5" /> : <Activity className="w-5 h-5" />} Lifetime Expenses</h2><div className="h-80 flex items-center justify-center">{expenseChartData.length > 0 ? (<ResponsiveContainer width="100%" height="100%">{lifetimeGraphType === 'pie' ? (<PieChart><Pie data={expenseChartData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">{expenseChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(value) => `₹${value}`} /><Legend /></PieChart>) : (<AreaChart data={expenseTrendData}><defs><linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff2a6d" stopOpacity={0.3}/><stop offset="95%" stopColor="#ff2a6d" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#333" /> <XAxis dataKey="name" stroke="#666" tick={{fill: '#666', fontSize: 10}} /> <YAxis stroke="#666" tick={{fill: '#666', fontSize: 10}} /> <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#ff2a6d', borderRadius: '8px' }} itemStyle={{ color: '#ff2a6d' }} formatter={(value) => `₹${value}`} /> <Area type="monotone" dataKey="value" stroke="#ff2a6d" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" /></AreaChart>)}</ResponsiveContainer>) : (<button onClick={() => handleQuickAdd('expense')} className="flex flex-col items-center gap-3 text-gray-600 hover:text-neon-red transition-colors group"><PlusCircle size={48} className="group-hover:scale-110 transition-transform" /><span className="font-bold">Add Your First Expense</span></button>)}</div></div>
                        </div>
                    </div>
                ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                    <div className="hidden md:block">
                        {timeFilter === 'monthly' ? (
                            <TransactionForm onSubmit={handleSubmit} editingId={editingId} workspace={workspace} formData={formData} setFormData={setFormData} onCancel={handleCancelEdit} />
                        ) : null}
                    </div>
                    
                    <div className="space-y-3">
                        <h3 className="text-gray-400 uppercase text-sm tracking-widest flex justify-between">
                            <span>{timeFilter === 'yearly' ? 'Yearly Performance' : 'Transactions'}</span>
                            {timeFilter !== 'monthly' && timeFilter !== 'yearly' && <span className="text-neon-purple text-xs">(Summary View)</span>}
                        </h3>
                        
                        {timeFilter === 'monthly' ? (
                            currentData.length > 0 ? (
                                currentData.map((item) => (
                                    <div key={item.id} className={`group flex justify-between items-center bg-card/80 backdrop-blur-md p-4 rounded-lg border transition-all ${editingId === item.id ? 'border-neon-purple' : 'border-transparent hover:border-gray-700 hover:bg-card'}`}>
                                        <div className="flex gap-4 items-center">
                                        <div className={`w-2 h-12 rounded-full ${item.type === 'income' ? 'bg-neon-green' : 'bg-neon-red'}`}></div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-lg text-white">{item.description}</h4>
                                            {item.isEdited && <span className="text-[10px] bg-neon-purple/10 text-neon-purple border border-neon-purple/30 px-1 rounded flex items-center gap-1">Edited {item.editedDateObj && item.editedDateObj.toLocaleDateString()}</span>}
                                            </div>
                                            <p className="text-xs text-gray-500 flex items-center gap-2"><Calendar size={10} /> {item.date} <span className="bg-gray-800 px-2 rounded-full text-gray-300">{item.category}</span></p>
                                        </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                        <span className={`font-bold ${item.type === 'income' ? 'text-neon-green' : 'text-neon-red'}`}>{item.type === 'income' ? '+' : '-'}₹{item.amount}</span>
                                        <div className="flex gap-1">
                                            {item.isEdited ? <button disabled className="text-gray-700 cursor-not-allowed p-2"><Lock size={16} /></button> : <button onClick={() => handleEditClick(item)} className="text-gray-500 hover:text-neon-purple p-2 hover:bg-gray-800 rounded transition-colors"><Pencil size={16} /></button>}
                                            <button onClick={() => handleDelete(item.id)} className="text-gray-500 hover:text-neon-red p-2 hover:bg-gray-800 rounded transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-600 py-10 border border-dashed border-gray-800 rounded-lg bg-card/20">No transactions found.</div>
                            )
                        ) : timeFilter === 'yearly' ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {getYearlyBreakdown().map((month, idx) => (
                                    <div key={idx} className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all 
                                        ${month.status === 'critical' ? 'bg-neon-red/10 border-neon-red text-neon-red' 
                                        : month.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-500' 
                                        : month.status === 'good' ? 'bg-neon-green/10 border-neon-green text-neon-green' 
                                        : 'bg-card/20 border-gray-800 text-gray-500 opacity-50'}`}>
                                        
                                        <h4 className="font-bold text-lg uppercase tracking-wider">{month.name}</h4>
                                        <span className="text-xl font-mono font-bold">₹{month.expense.toLocaleString()}</span>
                                        <div className="text-[10px] uppercase font-bold flex items-center gap-1">
                                            {month.status === 'critical' && <><AlertOctagon size={10} /> Over Limit</>}
                                            {month.status === 'warning' && <><AlertTriangle size={10} /> Near Limit</>}
                                            {month.status === 'good' && <><CheckCircle size={10} /> Excellent</>}
                                            {month.status === 'neutral' && 'No Data'}
                                        </div>
                                        {/* VISUAL PROGRESS BAR FOR MONTHLY BREAKDOWN */}
                                        {month.status !== 'neutral' && (
                                            <div className="w-full h-1 bg-gray-700 rounded-full overflow-hidden mt-1">
                                                <div className={`h-full ${month.status === 'critical' ? 'bg-neon-red' : month.status === 'warning' ? 'bg-yellow-500' : 'bg-neon-green'}`} style={{ width: `${Math.min((month.expense / budgetLimits.monthly) * 100, 100)}%` }}></div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                    </div>
                    
                    <div className="space-y-6">
                    <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                        <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold flex items-center gap-2 text-white"><PieIcon className="w-5 h-5" /> Analytics</h2><div className="flex bg-dark/50 rounded-lg p-1"><button onClick={() => setChartView('expense')} className={`px-3 py-1 text-xs rounded font-bold transition-all ${chartView === 'expense' ? 'bg-neon-red text-white' : 'text-gray-500 hover:text-white'}`}>EXPENSE</button><button onClick={() => setChartView('income')} className={`px-3 py-1 text-xs rounded font-bold transition-all ${chartView === 'income' ? 'bg-neon-green text-dark' : 'text-gray-500 hover:text-white'}`}>INCOME</button></div></div>
                        <div className="h-64"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={toggleChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">{toggleChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} formatter={(value) => `₹${value}`} /><Legend /></PieChart></ResponsiveContainer></div>
                    </div>
                    <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800 hover:border-gray-600 transition-colors">
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-200">Budget Limit</h2><button onClick={() => setShowTrackRecord(true)} className="text-xs text-neon-purple underline font-bold hover:text-white flex items-center gap-1"><HeartPulse size={12}/> View Health</button></div>
                        {/* --- PROGRESS BAR IS NOW HERE (TOP) --- */}
                        <CyberProgressBar current={totalExpense} max={getCurrentBudgetLimit()} label={timeFilter === 'yearly' ? 'Yearly' : 'Monthly'} />
                        <label className="text-sm text-gray-500 mb-2 block mt-4">Set {timeFilter === 'yearly' ? 'Yearly' : 'Monthly'} Max (₹)</label>
                        <input type="number" value={getCurrentBudgetLimit()} onChange={(e) => handleBudgetChange(e.target.value)} className="w-full bg-dark/50 border border-gray-700 rounded p-2 text-white focus:border-neon-purple outline-none" />
                    </div>
                    </div>
                </div>
                )}
            </>
        )}

        {/* --- TASKS VIEW --- */}
        {activeTab === 'tasks' && (
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in">
                <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-neon-purple"><ListTodo /> Mission Control</h2>
                    <form onSubmit={handleAddTask} className="flex gap-2">
                        <input type="text" placeholder="New Mission (e.g. Buy Groceries)" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} className="flex-1 bg-dark/50 border border-gray-700 rounded-lg p-3 text-white focus:border-neon-purple outline-none" />
                        <button className="bg-neon-purple/20 text-neon-purple border border-neon-purple px-4 rounded-lg hover:bg-neon-purple hover:text-white transition-all"><Plus /></button>
                    </form>
                </div>
                <div className="space-y-3">
                    {tasks.map(task => (
                        <div key={task.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${task.completed ? 'bg-gray-900/50 border-gray-800 opacity-50' : 'bg-card/80 border-gray-700 hover:border-neon-green'}`}>
                            <div className="flex items-center gap-3">
                                <button onClick={() => initiateTaskCompletion(task)} className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${task.completed ? 'bg-neon-green border-neon-green text-black' : 'border-gray-500 hover:border-neon-green'}`}>{task.completed && <Check size={16} />}</button>
                                <span className={task.completed ? 'line-through text-gray-500' : 'text-white'}>{task.title}</span>
                            </div>
                            <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-neon-red"><Trash2 size={18} /></button>
                        </div>
                    ))}
                    {tasks.length === 0 && <div className="text-center text-gray-500 py-10">No active missions. <br/><span className="text-xs text-gray-600">(Please Add some tasks here.)</span></div>}
                </div>
            </div>
        )}

        {/* --- HISTORY / ARCHIVES VIEW --- */}
        {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
                <div className="bg-card/80 backdrop-blur-md p-6 rounded-xl border border-gray-800">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-blue-500 mb-2"><History /> Monthly Archives</h2>
                    <p className="text-gray-400 text-sm">Review your past financial summaries. Clearing a month saves its totals here.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {archives.length > 0 ? archives.map((archive) => (
                        <div key={archive.id} className="bg-card/80 border border-gray-800 rounded-xl p-5 hover:border-blue-500/50 transition-colors relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Archive size={64} className="text-blue-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4 relative z-10">
                                {MONTHS[archive.month]} {archive.year}
                            </h3>
                            <div className="space-y-2 relative z-10">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Income</span>
                                    <span className="text-neon-green font-bold">₹{archive.totalIncome?.toLocaleString() || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 text-sm">Expense</span>
                                    <span className="text-neon-red font-bold">₹{archive.totalExpense?.toLocaleString() || 0}</span>
                                </div>
                                <div className="h-px bg-gray-800 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400 font-bold">Net Balance</span>
                                    <span className={`font-bold ${archive.balance >= 0 ? 'text-white' : 'text-neon-red'}`}>
                                        ₹{archive.balance?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500 uppercase flex justify-between">
                                <span>Folder: {archive.workspace || 'Personal'}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-full text-center text-gray-500 py-12 border border-dashed border-gray-800 rounded-xl bg-card/20">
                            <Archive className="mx-auto mb-3 opacity-50" size={32} />
                            No archived months found. <br/>
                            <span className="text-xs text-gray-600">When you complete a month, click "Archive Month" on the dashboard.</span>
                        </div>
                    )}
                </div>
            </div>
        )}

      </div>

      {/* MOBILE FAB */}
      {timeFilter !== 'lifetime' && activeTab === 'dashboard' && (
        <button onClick={() => setIsMobileFormOpen(true)} className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-neon-purple rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(176,38,255,0.5)] z-40 hover:scale-110 transition-transform"><Plus size={28} className="text-white" /></button>
      )}

      {/* TRANSACTION MODAL */}
      {isMobileFormOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-card border-t border-gray-700 sm:border rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Transaction' : 'Quick Add'}</h2>
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <TransactionForm onSubmit={handleSubmit} editingId={editingId} workspace={workspace} formData={formData} setFormData={setFormData} onCancel={handleCancelEdit} isMobileFormOpen={isMobileFormOpen} />
          </div>
        </div>
      )}

      {/* TASK COMPLETION MODAL */}
      {completingTask && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="w-full max-w-md bg-card border border-gray-700 rounded-xl p-6 shadow-2xl">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-green/50"><CheckSquare size={32} className="text-neon-green" /></div>
                    <h2 className="text-xl font-bold text-white">Mission Accomplished!</h2>
                    <p className="text-gray-400 mt-2">Did "{completingTask.title}" cost any money?</p>
                </div>
                <div className="mb-6">
                    <label className="text-xs text-gray-500 uppercase font-bold block mb-2">If yes, enter amount:</label>
                    <div className="relative"><span className="absolute left-3 top-3 text-neon-green font-bold">₹</span><input type="number" placeholder="0" value={taskExpenseAmount} onChange={(e) => setTaskExpenseAmount(e.target.value)} className="w-full bg-dark border border-gray-700 rounded-lg p-3 pl-8 text-white focus:border-neon-green outline-none font-mono text-lg" autoFocus /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => confirmTaskExpense(false)} className="py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold">No Cost</button>
                    <button onClick={() => confirmTaskExpense(true)} className="py-3 rounded-lg bg-neon-green text-black font-bold hover:opacity-90 flex items-center justify-center gap-2" disabled={!taskExpenseAmount}><Coins size={18} /> Add Expense</button>
                </div>
            </div>
        </div>
      )}

      {/* CLEAR DATA CONFIRM MODAL */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="w-full max-w-md bg-card border border-neon-red rounded-xl p-6 shadow-[0_0_30px_rgba(255,42,109,0.2)]">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-neon-red/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-red/50"><Archive size={32} className="text-neon-red" /></div>
                    <h2 className="text-2xl font-bold text-white">Archive {MONTHS[selectedMonth]}?</h2>
                    <p className="text-gray-400 mt-2">This will save a summary to your history, download a backup, and clear the dashboard for next month.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 rounded-lg border border-gray-600 text-gray-300 hover:bg-gray-800 font-bold">Cancel</button>
                    <button onClick={handleClearMonth} className="flex-1 py-3 rounded-lg bg-neon-red text-black font-bold hover:opacity-90 flex items-center justify-center gap-2">Archive & Clear</button>
                </div>
            </div>
        </div>
      )}

      {/* FOLDER ACTION MODAL */}
      {folderAction.type && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-card border border-gray-700 rounded-xl p-6 shadow-2xl scale-100">
             <div className="mb-6 text-center">
                {folderAction.type === 'delete' ? (<div className="w-16 h-16 bg-neon-red/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-red/50"><AlertOctagon size={32} className="text-neon-red" /></div>) : (<div className="w-16 h-16 bg-neon-purple/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-neon-purple/50"><Edit3 size={32} className="text-neon-purple" /></div>)}
                <h2 className="text-2xl font-bold text-white">{folderAction.type === 'delete' ? 'Delete Workspace?' : 'Rename Workspace'}</h2>
                <p className="text-gray-400 text-sm mt-2">{folderAction.type === 'delete' ? `Are you sure you want to delete "${folderAction.folder}" and all its transactions?` : `Enter a new name for "${folderAction.folder}".`}</p>
             </div>
             {folderAction.type === 'rename' && (<div className="mb-6"><input type="text" value={folderAction.newName} onChange={(e) => setFolderAction({...folderAction, newName: e.target.value})} className="w-full bg-dark border border-gray-700 rounded p-3 text-center text-white focus:border-neon-purple outline-none font-bold text-lg" autoFocus /></div>)}
             <div className="flex gap-3"><button onClick={() => setFolderAction({ type: null, folder: '', newName: '' })} className="flex-1 py-3 rounded border border-gray-700 text-gray-300 hover:bg-gray-800 font-bold">Cancel</button>{folderAction.type === 'delete' ? <button onClick={performFolderDelete} className="flex-1 py-3 rounded bg-neon-red text-black font-bold hover:opacity-90 transition-opacity">Yes, Delete It</button> : <button onClick={performFolderRename} className="flex-1 py-3 rounded bg-neon-purple text-white font-bold hover:opacity-90 transition-opacity">Update Name</button>}</div>
          </div>
        </div>
      )}

      {/* TRACK RECORD MODAL */}
      {showTrackRecord && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300 p-4">
          <div className="w-full max-w-lg bg-card border border-gray-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
             <div className={`absolute top-[-20%] left-[-20%] w-64 h-64 rounded-full blur-[100px] opacity-30 ${recordStats.status === 'good' ? 'bg-neon-green' : recordStats.status === 'warning' ? 'bg-yellow-500' : 'bg-neon-red'}`}></div>
             <button onClick={() => setShowTrackRecord(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-2 bg-black/50 rounded-full"><X size={24}/></button>
             <div className="relative z-10 text-center space-y-6">
                <h2 className="text-gray-400 text-sm uppercase tracking-widest font-bold flex items-center justify-center gap-2"><Activity size={16}/> Financial Health Report</h2>
                <div className="flex justify-center"><div className={`w-32 h-32 rounded-full flex items-center justify-center border-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${recordStats.status === 'good' ? 'border-neon-green bg-neon-green/10' : recordStats.status === 'warning' ? 'border-yellow-500 bg-yellow-500/10' : 'border-neon-red bg-neon-red/10'}`}>{recordStats.status === 'good' && <ThumbsUp size={56} className="text-neon-green animate-bounce" />}{recordStats.status === 'warning' && <AlertTriangle size={56} className="text-yellow-500 animate-pulse" />}{recordStats.status === 'critical' && <AlertOctagon size={56} className="text-neon-red animate-ping" />}</div></div>
                <div><h1 className={`text-3xl md:text-4xl font-black tracking-tight mb-2 uppercase ${recordStats.status === 'good' ? 'text-neon-green' : recordStats.status === 'warning' ? 'text-yellow-500' : 'text-neon-red'}`}>{recordStats.title}</h1><p className="text-white text-lg font-medium leading-relaxed">{recordStats.message}</p></div>
                <div className="bg-black/40 rounded-xl p-4 border border-gray-800 text-left space-y-3"><div className="flex justify-between text-sm text-gray-400"><span>Income:</span><span className="text-neon-green font-bold">+₹{totalIncome.toLocaleString()}</span></div><div className="flex justify-between text-sm text-gray-400"><span>Expense:</span><span className="text-neon-red font-bold">-₹{totalExpense.toLocaleString()}</span></div>{timeFilter !== 'lifetime' && (<div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mt-2 relative"><div className={`h-full transition-all duration-1000 ${recordStats.status === 'good' ? 'bg-neon-green' : recordStats.status === 'warning' ? 'bg-yellow-500' : 'bg-neon-red'}`} style={{ width: `${Math.min(recordStats.percentage, 100)}%` }}></div></div>)}</div>
                <button onClick={() => setShowTrackRecord(false)} className="w-full py-4 rounded-xl bg-white text-black font-bold hover:scale-105 transition-transform">Back to Dashboard</button>
             </div>
          </div>
        </div>
      )}

      {/* ABOUT DEVELOPER MODAL */}
      {showAbout && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in p-4" onClick={() => setShowAbout(false)}>
          <div className="w-full max-w-sm bg-card border border-gray-700 rounded-xl p-0 shadow-2xl overflow-hidden relative" onClick={(e) => e.stopPropagation()}>
             <button onClick={() => setShowAbout(false)} className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-1 hover:bg-black/80 z-20 transition-colors"><X size={20}/></button>
             <div className="h-24 bg-gradient-to-r from-neon-purple to-neon-green opacity-80"></div>
             <div className="px-6 pb-6 text-center -mt-12">
               <div className="w-24 h-24 rounded-full border-4 border-dark mx-auto overflow-hidden bg-black mb-4 relative group"><img src="https://avatars.githubusercontent.com/u/195559299?s=400&u=6dca48e5679ef8f5e8b2a2056edd5a25bd645cfb&v=4" alt="Developer" className="w-full h-full object-cover" /></div>
               <h2 className="text-2xl font-bold text-white tracking-tight">Tarun Sharma</h2>
               <p className="text-neon-purple text-sm font-bold uppercase tracking-widest mb-4">Full Stack Developer</p>
               <p className="text-gray-400 text-sm mb-6 leading-relaxed">Building futuristic apps with React, Tailwind, and Firebase. Passionate about clean code and neon aesthetics.</p>
               <div className="space-y-3"><a href="https://youtube.com/@Tarunsh-l3k" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-all transform hover:scale-105"><Youtube size={20} /> Subscribe on YouTube</a><div className="flex gap-3"><a href="https://github.com/tarunsharma01s" target="_blank" rel="noreferrer" className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center gap-2 transition-colors"><Github size={18} /> GitHub</a><a href="#" className="flex-1 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white flex items-center justify-center gap-2 transition-colors"><Globe size={18} /> Portfolio</a></div></div>
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;