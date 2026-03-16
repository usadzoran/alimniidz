import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home, 
  Video, 
  MessageSquare, 
  FileText, 
  User, 
  LogOut, 
  Plus, 
  Bell,
  Search,
  Menu,
  X,
  ChevronRight,
  BookOpen,
  Users,
  CheckCircle,
  Clock
} from 'lucide-react';
import { db, auth } from './firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  limit
} from 'firebase/firestore';
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';

// --- Helper for Activity Logging ---
const logActivity = async (action: string, details: string = '') => {
  if (!auth.currentUser) return;
  try {
    await addDoc(collection(db, 'activity_logs'), {
      user_id: auth.currentUser.uid,
      user_name: auth.currentUser.email,
      action,
      details,
      timestamp: serverTimestamp()
    });
  } catch (e) {
    console.error("Error logging activity:", e);
  }
};
import { UserProfile, UserRole } from './types';

// --- Components ---

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <img 
          src="https://picsum.photos/seed/teacher-whiteboard-online/800/600" 
          alt="Teacher with whiteboard and students online" 
          className="w-full max-w-md rounded-2xl shadow-2xl"
          referrerPolicy="no-referrer"
        />
      </motion.div>
      
      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-6xl font-bold text-emerald-600 mb-4 font-sans"
      >
        علّمني
      </motion.h1>
      
      <motion.p 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-slate-600 mb-6 max-w-sm"
      >
        تعلم مع أفضل الأساتذة مباشرة و بسهولة
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 mb-10 max-w-md"
      >
        <p className="text-slate-700 leading-relaxed text-sm md:text-base">
          منصة "علّمني" هي بوابتك المتكاملة للتعليم عن بعد، حيث نجمع بين نخبة من الأساتذة المتميزين والطلاب في بيئة تفاعلية متطورة. نوفر لك دروساً مباشرة، ملفات تعليمية، وفيديوهات توضيحية لتسهيل مسيرتك الدراسية وضمان تفوقك من أي مكان وفي أي وقت.
        </p>
      </motion.div>

      <div className="flex gap-4 w-full max-w-xs mb-12">
        <button 
          onClick={onFinish}
          className="flex-1 bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors"
        >
          ابدأ الآن
        </button>
      </div>

      {/* Team Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md md:max-w-2xl overflow-y-auto max-h-[45vh] px-4 custom-scrollbar"
      >
        <h3 className="text-xl font-bold text-slate-800 mb-6 border-r-4 border-emerald-500 pr-3 text-right">فريق العمل</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
          {/* Toufik */}
          <motion.div 
            whileHover={{ scale: 1.02, x: -4 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 flex-row-reverse cursor-default"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-emerald-100">
              <img 
                src="https://images.unsplash.com/photo-1566492031773-4f4e44671857?fit=crop&w=200&h=200" 
                alt="توفيق" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-right flex-1">
              <h4 className="font-bold text-slate-900">توفيق</h4>
              <p className="text-xs text-slate-500 leading-relaxed">مختص في المعلوماتية و الرياضيات</p>
            </div>
          </motion.div>

          {/* Abdelwahab */}
          <motion.div 
            whileHover={{ scale: 1.02, x: -4 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 flex-row-reverse cursor-default"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-emerald-100">
              <img 
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=200&h=200" 
                alt="عبدالوهاب" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-right flex-1">
              <h4 className="font-bold text-slate-900">عبدالوهاب</h4>
              <p className="text-xs text-slate-500 leading-relaxed">مختص بالبرمجة و صناعة المواقع و التطبيقات</p>
            </div>
          </motion.div>

          {/* Fictional 1: Sarah */}
          <motion.div 
            whileHover={{ scale: 1.02, x: -4 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 flex-row-reverse cursor-default"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-emerald-100">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" 
                alt="سارة" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-right flex-1">
              <h4 className="font-bold text-slate-900">سارة</h4>
              <p className="text-xs text-slate-500 leading-relaxed">مختصة في التصميم الجرافيكي وواجهة المستخدم (UI/UX)</p>
            </div>
          </motion.div>

          {/* Fictional 2: Omar */}
          <motion.div 
            whileHover={{ scale: 1.02, x: -4 }}
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 flex-row-reverse cursor-default"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border-2 border-emerald-100">
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Omar" 
                alt="عمر" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-right flex-1">
              <h4 className="font-bold text-slate-900">عمر</h4>
              <p className="text-xs text-slate-500 leading-relaxed">مختص في العلوم الطبيعية والفيزياء</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const AuthScreen = ({ onAuthSuccess }: { onAuthSuccess: (user: any) => void }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        try {
          await signInWithEmailAndPassword(auth, email, password);
          onAuthSuccess(auth.currentUser);
        } catch (error: any) {
          // Special case for admin: if login fails but it's the admin email, try to sign up
          if (email === 'wahablila31000@gmail.com') {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            onAuthSuccess(userCredential.user);
          } else {
            throw error;
          }
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        
        // Create user profile in Firestore
        const isMainAdmin = email === 'wahablila31000@gmail.com';
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          auth_id: firebaseUser.uid,
          first_name: isMainAdmin ? 'المدير' : firstName,
          last_name: isMainAdmin ? 'العام' : lastName,
          role: isMainAdmin ? 'admin' : role,
          account_status: isMainAdmin ? 'active' : (role === 'teacher' ? 'pending' : 'active')
        });
        
        onAuthSuccess(firebaseUser);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center">
          {isLogin ? 'تسجيل الدخول' : 'إنشاء حساب جديد'}
        </h2>
        <p className="text-slate-500 text-center mb-8">
          {isLogin ? 'مرحباً بك مجدداً في علّمني' : 'انضم إلى مجتمعنا التعليمي'}
        </p>

        {!isLogin && (
          <div className="flex gap-2 mb-6 p-1 bg-slate-100 rounded-xl">
            <button 
              onClick={() => setRole('student')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${role === 'student' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
            >
              طالب
            </button>
            <button 
              onClick={() => setRole('teacher')}
              className={`flex-1 py-2 rounded-lg font-medium transition-all ${role === 'teacher' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500'}`}
            >
              أستاذ
            </button>
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div className="grid grid-cols-2 gap-4">
              <input 
                type="text" 
                placeholder="الاسم الأول" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <input 
                type="text" 
                placeholder="اللقب" 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          )}
          <input 
            type="email" 
            placeholder="البريد الإلكتروني" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="كلمة المرور" 
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'جاري التحميل...' : (isLogin ? 'دخول' : 'تسجيل')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-emerald-600 font-medium hover:underline"
          >
            {isLogin ? 'ليس لديك حساب؟ سجل الآن' : 'لديك حساب بالفعل؟ سجل دخولك'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ profile }: { profile: UserProfile | null }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-slate-100 z-40 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <BookOpen className="text-emerald-600 w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-slate-900">علّمني</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-50 rounded-full relative">
          <Bell className="w-6 h-6" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-emerald-500">
          <img 
            src={profile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.auth_id}`} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </nav>
  );
};

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'الرئيسية' },
    { id: 'live', icon: Video, label: 'مباشر' },
    { id: 'messages', icon: MessageSquare, label: 'رسائل' },
    { id: 'files', icon: FileText, label: 'ملفات' },
    { id: 'profile', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 flex items-center justify-between z-40">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === tab.id ? 'text-emerald-600' : 'text-slate-400'}`}
        >
          <tab.icon className={`w-6 h-6 ${activeTab === tab.id ? 'fill-emerald-600/10' : ''}`} />
          <span className="text-[10px] font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<any[]>([]);
  const [liveClasses, setLiveClasses] = useState<any[]>([]);

  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        await fetchProfile(firebaseUser.uid, firebaseUser.email || undefined);
        fetchData();
        logActivity('دخول', 'قام المستخدم بتسجيل الدخول');
      } else {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    // Handle direct admin access link
    const params = new URLSearchParams(window.location.search);
    if (params.get('access') === 'admin_wahab') {
      signInWithEmailAndPassword(auth, 'wahablila31000@gmail.com', 'vampirewahab31').then(() => {
        setShowAdmin(true);
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }

    return () => unsubscribeAuth();
  }, []);

  const fetchData = () => {
    // Real-time Posts
    const postsQuery = query(collection(db, 'posts'), orderBy('created_at', 'desc'));
    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postsData);
    });

    // Real-time Activity Logs (for Admin)
    let unsubscribeLogs = () => {};
    if (profile?.role === 'admin') {
      const logsQuery = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(50));
      unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
        const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActivityLogs(logsData);
      });
    }

    return () => {
      unsubscribePosts();
      unsubscribeLogs();
    };
  };

  const fetchProfile = async (authId: string, userEmail?: string) => {
    const docRef = doc(db, 'users', authId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      // Force admin role for the specific email
      if (userEmail === 'wahablila31000@gmail.com' && data.role !== 'admin') {
        await updateDoc(docRef, { role: 'admin' });
        setProfile({ ...data, role: 'admin' });
      } else {
        setProfile(data);
      }
    } else if (userEmail === 'wahablila31000@gmail.com') {
      const newProfile = {
        auth_id: authId,
        first_name: 'المدير',
        last_name: 'العام',
        role: 'admin' as UserRole,
        account_status: 'active'
      };
      await setDoc(docRef, newProfile);
      setProfile(newProfile as UserProfile);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      logActivity('تصفح', `انتقل إلى تبويب: ${activeTab}`);
    }
  }, [activeTab]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
    return <AuthScreen onAuthSuccess={(u) => {
      setUser(u);
      fetchProfile(u.id, u.email);
    }} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 pt-16" dir="rtl">
      <Navbar profile={profile} />
      
      {showAdmin && profile?.role === 'admin' ? (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">لوحة التحكم</h1>
            <button onClick={() => setShowAdmin(false)} className="text-emerald-600 font-bold">العودة للتطبيق</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                النشاط المباشر (Realtime)
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 border-b border-slate-50 pb-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-800">{log.user_name}</p>
                      <p className="text-xs text-slate-600">{log.action}: {log.details}</p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleTimeString('ar-EG') : 'الآن'}
                      </p>
                    </div>
                  </div>
                ))}
                {activityLogs.length === 0 && (
                  <p className="text-center text-slate-400 py-8">لا يوجد نشاط حالياً</p>
                )}
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center items-center text-center">
              <p className="text-slate-500 text-sm mb-1">الزيارات اليومية</p>
              <h3 className="text-4xl font-bold text-emerald-600">3,500</h3>
              <div className="mt-4 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 w-3/4"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">طلبات انضمام الأساتذة</h3>
              <button className="text-emerald-600 text-sm font-bold">عرض الكل</button>
            </div>
            <div className="divide-y divide-slate-50">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=admin${i}`} alt="User" className="w-10 h-10 rounded-full bg-slate-100" />
                    <div>
                      <h4 className="font-bold text-slate-900">أ. كمال بن يوسف</h4>
                      <p className="text-xs text-slate-500">مادة العلوم الطبيعية</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold">قبول</button>
                    <button className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-xs font-bold">رفض</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <main className="max-w-2xl mx-auto p-4">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Stories/Quick Actions */}
              <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                <div className="flex-shrink-0 flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full border-2 border-emerald-500 p-1">
                    <div className="w-full h-full bg-emerald-100 rounded-full flex items-center justify-center">
                      <Plus className="text-emerald-600" />
                    </div>
                  </div>
                  <span className="text-xs font-medium">إضافة</span>
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-full border-2 border-slate-200 p-1">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                        alt="User" 
                        className="w-full h-full rounded-full bg-slate-100"
                      />
                    </div>
                    <span className="text-xs font-medium">أستاذ {i}</span>
                  </div>
                ))}
              </div>

              {/* Feed Posts */}
              {posts.length > 0 ? posts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img 
                        src={post.author?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_id}`} 
                        alt="Author" 
                        className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-slate-900">{post.author?.first_name} {post.author?.last_name}</h4>
                        <p className="text-xs text-slate-500">{new Date(post.created_at).toLocaleDateString('ar-EG')} • منشور</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="px-4 pb-4">
                    <p className="text-slate-700 leading-relaxed mb-4">{post.content}</p>
                    {post.image_url && (
                      <img 
                        src={post.image_url} 
                        alt="Post content" 
                        className="w-full h-64 object-cover rounded-2xl mb-4"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    
                    <div className="flex items-center gap-6 pt-2 border-t border-slate-50">
                      <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">إعجاب</span>
                      </button>
                      <button className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 transition-colors">
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-sm font-medium">تعليق</span>
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                  <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">لا توجد منشورات حالياً</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'live' && (
            <motion.div 
              key="live"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">الدروس المباشرة</h2>
                <div className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 animate-pulse">
                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                  مباشر الآن
                </div>
              </div>

              {/* Live Session Card */}
              <div className="bg-emerald-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">18 / 20 طالب</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">مراجعة شاملة للفيزياء</h3>
                  <p className="text-emerald-100 mb-6">الأستاذ: أحمد كمال • الوحدة الثانية</p>
                  <button className="bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-colors">
                    انضم الآن
                  </button>
                </div>
                <Video className="absolute -bottom-4 -right-4 w-32 h-32 text-white/10 rotate-12" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-8">الدروس القادمة</h3>
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-slate-100 flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-500">
                    <Clock className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold">18:00</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">درس اللغة الإنجليزية</h4>
                    <p className="text-xs text-slate-500">اليوم • الأستاذة سارة</p>
                  </div>
                  <button className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl">
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}

          {activeTab === 'messages' && (
            <motion.div 
              key="messages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6">الرسائل</h2>
              {[1, 2, 3, 4].map((i) => (
                <button key={i} className="w-full bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                  <div className="relative">
                    <img 
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`} 
                      alt="User" 
                      className="w-14 h-14 rounded-full bg-slate-100"
                    />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-slate-900">أحمد محمود</h4>
                      <span className="text-[10px] text-slate-400">12:45 م</span>
                    </div>
                    <p className="text-sm text-slate-500 truncate">شكراً جزيلاً يا أستاذ على الشرح الرائع...</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div 
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">الملفات والمواد</h2>
                <button className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Search className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {['الرياضيات', 'الفيزياء', 'العلوم', 'الأدب'].map((subject) => (
                  <div key={subject} className="bg-white p-6 rounded-3xl border border-slate-100 text-center hover:shadow-md transition-shadow cursor-pointer">
                    <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-emerald-600 w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-slate-900 mb-1">{subject}</h4>
                    <p className="text-xs text-slate-500">24 ملف متاح</p>
                  </div>
                ))}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mt-8">آخر الملفات المضافة</h3>
              {[1, 2].map((i) => (
                <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                    <span className="font-bold text-xs">PDF</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">ملخص الوحدة الأولى - {i}</h4>
                    <p className="text-[10px] text-slate-500">2.4 MB • بصيغة PDF</p>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-emerald-600">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div 
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-3xl p-8 text-center shadow-sm border border-slate-100">
                <div className="relative inline-block mb-4">
                  <img 
                    src={profile?.profile_image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.auth_id}`} 
                    alt="Profile" 
                    className="w-32 h-32 rounded-full border-4 border-emerald-500 p-1"
                  />
                  <button className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full shadow-lg">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold text-slate-900">{profile?.first_name} {profile?.last_name}</h2>
                <p className="text-slate-500 mb-6">{profile?.role === 'student' ? 'طالب' : 'أستاذ'}</p>
                
                <div className="grid grid-cols-3 gap-4 border-t border-slate-50 pt-6">
                  <div>
                    <p className="text-xl font-bold text-slate-900">12</p>
                    <p className="text-xs text-slate-500">مواد</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">45</p>
                    <p className="text-xs text-slate-500">ملفات</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold text-slate-900">8</p>
                    <p className="text-xs text-slate-500">مباشر</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button className="w-full bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-slate-700 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">المواد المشترك بها</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                <button className="w-full bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between text-slate-700 hover:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <span className="font-medium">ملفاتي المحملة</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
                {profile?.role === 'admin' && (
                  <button 
                    onClick={() => setShowAdmin(true)}
                    className="w-full bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between text-white hover:bg-slate-800"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium">لوحة تحكم المدير</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </button>
                )}
                <button 
                  onClick={async () => {
                    await signOut(auth);
                    setUser(null);
                    setProfile(null);
                  }}
                  className="w-full bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center justify-between text-red-600 hover:bg-red-100 mt-8"
                >
                  <div className="flex items-center gap-3">
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold">تسجيل الخروج</span>
                  </div>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      )}

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
